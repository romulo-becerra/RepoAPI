require 'rails_helper'

RSpec.describe 'Basic Auth', type: :request do
  let(:user) { create(:user, pin: '1234') }
  let(:jwt) { JsonWebToken.encode(user_id: user.id) }
  let(:basic_password) { 'local-test-password-123' }

  def jwt_headers
    { 'Authorization' => "Bearer #{jwt}" }
  end

  def basic_headers(password = basic_password)
    credentials = Base64.strict_encode64("#{user.email}:#{password}")
    { 'Authorization' => "Basic #{credentials}" }
  end

  describe 'PUT /api/v1/users/:id/basic_auth_password' do
    it 'sets a separate Basic Auth password for the authenticated user' do
      put "/api/v1/users/#{user.id}/basic_auth_password",
          params: { basic_auth_password: basic_password },
          headers: jwt_headers,
          as: :json

      expect(response).to have_http_status(:ok)
      expect(user.reload.authenticate_basic_auth_password(basic_password)).to be_truthy
      expect(user.authenticate_pin('1234')).to be_truthy
    end

    it 'rejects a password shorter than 12 characters' do
      put "/api/v1/users/#{user.id}/basic_auth_password",
          params: { basic_auth_password: 'short' },
          headers: jwt_headers,
          as: :json

      expect(response).to have_http_status(:unprocessable_entity)
    end
  end

  describe 'Basic Auth on protected endpoints' do
    before do
      user.update!(basic_auth_password: basic_password)
    end

    it 'authenticates the user and preserves the existing account authorization' do
      get "/api/v1/users/#{user.id}/profile", headers: basic_headers

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body).dig('user', 'id')).to eq(user.id)
    end

    it 'rejects invalid Basic Auth credentials' do
      get "/api/v1/users/#{user.id}/profile", headers: basic_headers('wrong-password-123')

      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe 'PUT /api/v1/manager/users/:id/basic_auth_password' do
    let(:admin) { create(:user, role: :admin, pin: '1234') }
    let(:admin_headers) do
      { 'Authorization' => "Bearer #{JsonWebToken.encode(user_id: admin.id)}" }
    end

    it 'allows an admin to set a Basic Auth password for an existing user' do
      put "/api/v1/manager/users/#{user.id}/basic_auth_password",
          params: { basic_auth_password: basic_password },
          headers: admin_headers,
          as: :json

      expect(response).to have_http_status(:ok)
      expect(user.reload.authenticate_basic_auth_password(basic_password)).to be_truthy
      expect(JSON.parse(response.body)).not_to have_key('basic_auth_password')
    end

    it 'rejects managers from changing another user password' do
      manager = create(:user, role: :manager, pin: '1234')
      headers = { 'Authorization' => "Bearer #{JsonWebToken.encode(user_id: manager.id)}" }

      put "/api/v1/manager/users/#{user.id}/basic_auth_password",
          params: { basic_auth_password: basic_password },
          headers: headers,
          as: :json

      expect(response).to have_http_status(:forbidden)
      expect(user.reload.basic_auth_password_digest).to be_nil
    end
  end

  describe 'POST /api/v1/manager/users' do
    let(:admin) { create(:user, role: :admin, pin: '1234') }
    let(:admin_headers) do
      { 'Authorization' => "Bearer #{JsonWebToken.encode(user_id: admin.id)}" }
    end

    it 'creates a user with an optional Basic Auth password' do
      post '/api/v1/manager/users',
           params: {
             first_name: 'New',
             last_name: 'Customer',
             email: 'new.customer@example.com',
             pin: '1234',
             basic_auth_password: basic_password
           },
           headers: admin_headers,
           as: :json

      created_user = User.find_by!(email: 'new.customer@example.com')
      expect(response).to have_http_status(:created)
      expect(created_user.authenticate_basic_auth_password(basic_password)).to be_truthy
      expect(JSON.parse(response.body).to_s).not_to include(basic_password)
    end
  end
end
