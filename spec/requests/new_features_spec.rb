require 'rails_helper'

RSpec.describe 'New account and user APIs', type: :request do
  let(:user) { create(:user, pin: '1234') }
  let(:account) { create(:account, user: user, balance: 1000, account_number: '1111111111', clabe: '111111111111111111') }
  let(:recipient_user) { create(:user, email: 'recipient@example.com', pin: '1234') }
  let(:recipient_account) { create(:account, user: recipient_user, balance: 500, account_number: '2222222222', clabe: '222222222222222222') }
  let(:token) { JsonWebToken.encode(user_id: user.id) }

  def auth_headers
    {
      'Authorization' => "Bearer #{token}",
      'Content-Type' => 'application/json'
    }
  end

  describe 'GET /api/v1/accounts/:id/balance' do
    it 'returns the current account balance' do
      get "/api/v1/accounts/#{account.id}/balance", headers: auth_headers

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)['balance']).to eq(1000)
    end
  end

  describe 'POST /api/v1/accounts/:id/transfer' do
    it 'transfers funds between accounts' do
      post "/api/v1/accounts/#{account.id}/transfer",
           params: {
             recipient_account_id: recipient_account.id,
             amount: 200,
             description: 'Pago de renta'
           },
           headers: auth_headers,
           as: :json

      expect(response).to have_http_status(:ok)
      expect(account.reload.balance).to eq(800)
      expect(recipient_account.reload.balance).to eq(700)
    end
  end

  describe 'PUT /api/v1/users/:id/pin' do
    it 'changes the user pin' do
      put "/api/v1/users/#{user.id}/pin",
          params: {
            current_pin: '1234',
            new_pin: '5678'
          },
          headers: auth_headers,
          as: :json

      expect(response).to have_http_status(:ok)
      expect(user.reload.authenticate_pin('5678')).to be_truthy
    end
  end

  describe 'GET /api/v1/users/:id/profile' do
    it 'returns the authenticated user profile' do
      get "/api/v1/users/#{user.id}/profile", headers: auth_headers

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)['user']['id']).to eq(user.id)
    end
  end
end
