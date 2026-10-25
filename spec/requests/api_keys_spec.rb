require 'rails_helper'

RSpec.describe 'API keys', type: :request do
  let(:user) { create(:user, pin: '1234') }
  let(:token) { JsonWebToken.encode(user_id: user.id) }
  let(:headers) { { 'Authorization' => "Bearer #{token}" } }
  let(:keys_path) { "/api/v1/users/#{user.id}/api_keys" }

  describe 'POST /api/v1/users/:user_id/api_keys' do
    it 'creates a key and returns its secret only in the creation response' do
      post keys_path, params: { name: 'Local integration' }, headers: headers, as: :json

      body = JSON.parse(response.body)
      secret = body.dig('api_key', 'secret')
      expect(response).to have_http_status(:created)
      expect(secret).to match(/\Aafk_[A-Za-z0-9_-]{43}\z/)
      expect(user.api_keys.count).to eq(1)
      expect(user.api_keys.first.token_digest).not_to eq(secret)

      get keys_path, headers: headers
      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body).to_s).not_to include(secret)
    end

    it 'rejects an empty name' do
      post keys_path, params: { name: ' ' }, headers: headers, as: :json

      expect(response).to have_http_status(:unprocessable_entity)
    end

    it 'does not allow access to another user keys' do
      other_user = create(:user, pin: '1234')

      post "/api/v1/users/#{other_user.id}/api_keys",
           params: { name: 'Not mine' },
           headers: headers,
           as: :json

      expect(response).to have_http_status(:forbidden)
    end
  end

  describe 'API key authentication and revocation' do
    it 'authenticates a protected request and records the last use' do
      key, secret = ApiKey.issue_for(user: user, name: 'Test client')

      get "/api/v1/users/#{user.id}/profile", headers: { 'X-API-Key' => secret }

      expect(response).to have_http_status(:ok)
      expect(key.reload.last_used_at).to be_present
    end

    it 'revokes one key without affecting other keys' do
      key_to_revoke, revoked_secret = ApiKey.issue_for(user: user, name: 'Revoke me')
      _other_key, active_secret = ApiKey.issue_for(user: user, name: 'Keep me')

      delete "#{keys_path}/#{key_to_revoke.id}", headers: headers

      expect(response).to have_http_status(:ok)
      get "/api/v1/users/#{user.id}/profile", headers: { 'X-API-Key' => revoked_secret }
      expect(response).to have_http_status(:unauthorized)

      get "/api/v1/users/#{user.id}/profile", headers: { 'X-API-Key' => active_secret }
      expect(response).to have_http_status(:ok)
    end
  end
end
