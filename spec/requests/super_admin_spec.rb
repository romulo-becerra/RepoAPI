require 'rails_helper'

RSpec.describe 'Super admin access', type: :request do
  let(:super_admin) { create(:user, role: :super_admin, pin: '2468') }
  let(:admin) { create(:user, role: :admin, pin: '1357') }

  def auth(user)
    { 'Authorization' => "Bearer #{JsonWebToken.encode(user_id: user.id)}" }
  end

  it 'grants the super admin management and admin-only access' do
    get '/api/v1/manager/users', headers: auth(super_admin), as: :json

    expect(response).to have_http_status(:ok), response.body

    post '/api/v1/manager/users',
         params: {
           first_name: 'Managed',
           last_name: 'Customer',
           email: 'managed.customer@example.com',
           pin: '5678',
           role: 'customer'
         },
         headers: auth(super_admin),
         as: :json

    expect(response).to have_http_status(:created), response.body
  end

  it 'allows a super admin to create a customer service user' do
    post '/api/v1/manager/users',
         params: {
           first_name: 'Service',
           last_name: 'Agent',
           email: 'service.agent@example.com',
           pin: '5678',
           role: 'customer_service'
         },
         headers: auth(super_admin),
         as: :json

    expect(response).to have_http_status(:created), response.body
    expect(User.find_by!(email: 'service.agent@example.com').customer_service?).to be(true)
  end

  it 'authenticates a super admin on the admin-specific login endpoint' do
    account = super_admin.accounts.find_by!(default: true)

    post '/api/v1/login/admin',
         params: { account_number: account.account_number, pin: '2468' },
         as: :json

    expect(response).to have_http_status(:ok), response.body
    expect(JSON.parse(response.body).dig('user', 'role')).to eq('super_admin')
  end

  it 'returns hourly transaction counts for the manager dashboard' do
    transaction_time = Time.current.change(hour: 14)
    Transaction.create!(
      account: super_admin.accounts.find_by!(default: true),
      transaction_type: :deposit,
      amount: 10,
      status: :completed,
      created_at: transaction_time,
      updated_at: transaction_time
    )

    get '/api/v1/manager/reports/dashboard', headers: auth(super_admin), as: :json

    expect(response).to have_http_status(:ok), response.body
    hourly_transactions = JSON.parse(response.body).fetch('hourly_transactions')
    expect(hourly_transactions.keys).to eq((0..23).map(&:to_s))
    expect(hourly_transactions.fetch('14')).to eq(1)
  end

  it 'allows a super admin, but not a regular admin, to create another super admin' do
    post '/api/v1/manager/users',
         params: {
           first_name: 'Second',
           last_name: 'Super Admin',
           email: 'second.super.admin@example.com',
           pin: '5678',
           role: 'super_admin'
         },
         headers: auth(super_admin),
         as: :json

    expect(response).to have_http_status(:created), response.body
    expect(User.find_by!(email: 'second.super.admin@example.com').super_admin?).to be(true)

    post '/api/v1/manager/users',
         params: {
           first_name: 'Forbidden',
           last_name: 'Super Admin',
           email: 'forbidden.super.admin@example.com',
           pin: '9876',
           role: 'super_admin'
         },
         headers: auth(admin),
         as: :json

    expect(response).to have_http_status(:forbidden)
    expect(User.find_by(email: 'forbidden.super.admin@example.com')).to be_nil
  end
end
