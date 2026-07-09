require 'rails_helper'

RSpec.describe 'New features APIs', type: :request do
  let(:user) { create(:user, pin: '1234') }
  let(:account) { create(:account, user: user, balance: 1000, account_number: '1111111111', clabe: '111111111111111111') }
  let(:recipient_user) { create(:user, email: 'recipient@example.com', pin: '1234') }
  let(:recipient_account) { create(:account, user: recipient_user, balance: 500, account_number: '2222222222', clabe: '222222222222222222') }
  let(:service) { create(:service, name: 'Agua', description: 'Pago de agua', account: create(:account, account_number: '3333333333', clabe: '333333333333333333')) }
  let(:token) { JsonWebToken.encode(user_id: user.id) }

  def auth_headers
    {
      'Authorization' => "Bearer #{token}",
      'Content-Type' => 'application/json'
    }
  end

  describe 'GET /api/v1/accounts/:id/balance' do
    it 'returns current balance' do
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

  describe 'GET /api/v1/accounts/:id/summary' do
    it 'returns monthly summary' do
      get "/api/v1/accounts/#{account.id}/summary", headers: auth_headers
      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)['account_id']).to eq(account.id)
    end
  end

  describe 'PUT /api/v1/users/:id/pin' do
    it 'updates the user pin' do
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
    it 'returns user profile' do
      get "/api/v1/users/#{user.id}/profile", headers: auth_headers
      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)['user']['id']).to eq(user.id)
    end
  end

  describe 'GET /api/v1/services/:id' do
    it 'returns service details' do
      get "/api/v1/services/#{service.id}", headers: auth_headers
      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)['name']).to eq('Agua')
    end
  end

  describe 'GET /api/v1/recipients/search' do
    it 'finds recipient by clabe' do
      recipient = create(:recipient, user: user, account: recipient_account, name: 'Juan')

      get '/api/v1/recipients/search', params: { clabe: recipient_account.clabe }, headers: auth_headers

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)['name']).to eq('Juan')
    end
  end

  describe 'POST /api/v1/logout' do
    it 'returns logout response' do
      post '/api/v1/logout', headers: auth_headers, as: :json
      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)['message']).to eq('Sesión cerrada correctamente')
    end
  end
end
