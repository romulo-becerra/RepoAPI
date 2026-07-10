require 'rails_helper'

RSpec.describe 'Manager::Users API', type: :request do
  let(:manager) { create(:user, role: :manager, pin: '1234') }
  let!(:manager_account) { create(:account, user: manager) }
  let(:customer) { create(:user, pin: '1234') }
  let!(:customer_account) { create(:account, user: customer) }
  let(:headers) do
    {
      'Authorization' => "Bearer #{JsonWebToken.encode(user_id: manager.id)}",
      'Content-Type' => 'application/json'
    }
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
end
