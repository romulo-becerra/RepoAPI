require 'rails_helper'

RSpec.describe 'Manager::Users API', type: :request do
  before { host! 'localhost' }

  let(:admin) { create(:user, role: :admin, pin: '1234') }
  let!(:admin_account) { create(:account, user: admin) }
  let(:manager) { create(:user, role: :manager, pin: '1234') }
  let!(:manager_account) { create(:account, user: manager) }
  let(:customer) { create(:user, pin: '1234') }
  let!(:customer_account) { create(:account, user: customer) }
  let(:headers) do
    {
      'Authorization' => "Bearer #{JsonWebToken.encode(user_id: admin.id)}",
      'Content-Type' => 'application/json'
    }
  end
  let(:manager_headers) do
    {
      'Authorization' => "Bearer #{JsonWebToken.encode(user_id: manager.id)}",
      'Content-Type' => 'application/json'
    }
  end

  describe 'GET /api/v1/manager/users/:id' do
    it 'returns full user detail including status and account info' do
      get "/api/v1/manager/users/#{customer.id}", headers: headers, as: :json

      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)['user']
      default_account = customer.accounts.find_by(default: true)
      expect(body['id']).to eq(customer.id)
      expect(body).to have_key('date_of_birth')
      expect(body['active']).to eq(true)
      expect(body['blocked']).to eq(false)
      expect(body['deleted']).to eq(false)
      expect(body['status']).to eq('active')
      expect(body['account_number']).to eq(default_account.account_number)
      expect(body['accounts']).to be_an(Array)
      expect(body['accounts'].map { |a| a['account_number'] }).to include(customer_account.account_number)
    end

    it 'returns not found for an unknown user' do
      get '/api/v1/manager/users/999999', headers: headers, as: :json

      expect(response).to have_http_status(:not_found)
    end
  end

  describe 'PATCH /api/v1/manager/users/:id/block' do
    it 'blocks a customer user' do
      patch "/api/v1/manager/users/#{customer.id}/block", headers: headers, as: :json

      expect(response).to have_http_status(:ok)
      expect(customer.reload.blocked).to eq(true)
      expect(JSON.parse(response.body)['message']).to eq('Usuario bloqueado correctamente')
    end
  end

  describe 'PATCH /api/v1/manager/users/:id/unblock' do
    it 'unblocks a previously blocked user' do
      customer.update!(blocked: true)

      patch "/api/v1/manager/users/#{customer.id}/unblock", headers: headers, as: :json

      expect(response).to have_http_status(:ok)
      expect(customer.reload.blocked).to eq(false)
      expect(JSON.parse(response.body)['message']).to eq('Usuario desbloqueado correctamente')
    end
  end

  describe 'PATCH /api/v1/manager/users/:id/deactivate' do
    it 'deactivates a user and clears blocked flag' do
      customer.update!(blocked: true)

      patch "/api/v1/manager/users/#{customer.id}/deactivate", headers: headers, as: :json

      expect(response).to have_http_status(:ok)
      expect(customer.reload.active).to eq(false)
      expect(customer.reload.blocked).to eq(false)
      expect(JSON.parse(response.body)['message']).to eq('Usuario desactivado correctamente')
    end
  end

  describe 'DELETE /api/v1/manager/users/:id' do
    it 'deletes a user' do
      delete "/api/v1/manager/users/#{customer.id}", headers: headers, as: :json

      expect(response).to have_http_status(:ok)
      expect(User.find_by(id: customer.id)).to be_nil
    end
  end

  describe 'role restrictions' do
    it 'lets a manager read users but not mutate them' do
      get "/api/v1/manager/users/#{customer.id}", headers: manager_headers, as: :json
      expect(response).to have_http_status(:ok)

      patch "/api/v1/manager/users/#{customer.id}/block", headers: manager_headers, as: :json
      expect(response).to have_http_status(:forbidden)
      expect(JSON.parse(response.body)['errors']).to include('Admin')

      patch "/api/v1/manager/users/#{customer.id}/unblock", headers: manager_headers, as: :json
      expect(response).to have_http_status(:forbidden)

      delete "/api/v1/manager/users/#{customer.id}", headers: manager_headers, as: :json
      expect(response).to have_http_status(:forbidden)
      expect(User.find_by(id: customer.id)).to be_present
    end

    it 'rejects a cashier from the user management endpoint' do
      cashier = create(:user, role: :cashier, pin: '1234')
      create(:account, user: cashier)
      cashier_headers = { 'Authorization' => "Bearer #{JsonWebToken.encode(user_id: cashier.id)}" }

      get '/api/v1/manager/users', headers: cashier_headers, as: :json

      expect(response).to have_http_status(:forbidden)
    end

    it 'rejects a customer from the user management endpoint' do
      customer_token = { 'Authorization' => "Bearer #{JsonWebToken.encode(user_id: customer.id)}" }

      get '/api/v1/manager/users', headers: customer_token, as: :json

      expect(response).to have_http_status(:forbidden)
    end

    it 'rejects an unknown role on user creation' do
      post '/api/v1/manager/users',
           params: { first_name: 'Bad', last_name: 'Role', email: 'bad.role@example.com', pin: '1234', role: 'superuser' },
           headers: headers,
           as: :json

      expect(response).to have_http_status(:unprocessable_entity)
      expect(JSON.parse(response.body)['errors']).to include('Rol no valido')
    end

    it 'creates a cashier user when requested by an admin' do
      post '/api/v1/manager/users',
           params: { first_name: 'Caja', last_name: 'Uno', email: 'caja.uno@example.com', pin: '1234', role: 'cashier' },
           headers: headers,
           as: :json

      expect(response).to have_http_status(:created), response.body
      created = User.find_by(email: 'caja.uno@example.com')
      expect(created.role).to eq('cashier')
      expect(created.staff?).to eq(true)
      expect(created.management?).to eq(false)
    end

    it 'creates and updates date of birth through the admin API' do
      post '/api/v1/manager/users',
           params: {
             first_name: 'Fecha',
             last_name: 'Nacimiento',
             email: 'fecha.nacimiento@example.com',
             pin: '1234',
             role: 'customer',
             date_of_birth: '1990-04-12'
           },
           headers: headers,
           as: :json

      expect(response).to have_http_status(:created), response.body
      created_user = User.find_by!(email: 'fecha.nacimiento@example.com')
      expect(created_user.date_of_birth).to eq(Date.new(1990, 4, 12))
      expect(JSON.parse(response.body).dig('user', 'date_of_birth')).to eq('1990-04-12')

      patch "/api/v1/manager/users/#{created_user.id}",
            params: { date_of_birth: '1992-06-15' },
            headers: headers,
            as: :json

      expect(response).to have_http_status(:ok), response.body
      expect(created_user.reload.date_of_birth).to eq(Date.new(1992, 6, 15))
      expect(JSON.parse(response.body).dig('user', 'date_of_birth')).to eq('1992-06-15')
    end

    it 'creates a cashier user with the requested account number when an admin specifies it' do
      account_number = "9#{SecureRandom.random_number(1_000_000_000).to_s.rjust(9, '0')}"

      post '/api/v1/manager/users',
           params: { first_name: 'Caja', last_name: 'Tres', email: 'caja.tres@example.com', pin: '1234', role: 'cashier', account_number: account_number },
           headers: headers,
           as: :json

      expect(response).to have_http_status(:created), response.body
      created = User.find_by(email: 'caja.tres@example.com')
      expect(created).to be_present
      expect(created.role).to eq('cashier')
      expect(created.accounts.find_by(default: true).account_number).to eq(account_number)
    end
  end
end
