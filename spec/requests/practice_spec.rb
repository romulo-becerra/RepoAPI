require 'rails_helper'

RSpec.describe 'Practice API', type: :request do
  let(:user) { create(:user, pin: '1234') }
  let(:path) { '/api/v1/practice/params' }

  it 'accepts query parameters when authenticated with an API key' do
    _api_key, secret = ApiKey.issue_for(user: user, name: 'Practice')

    get path,
        params: { name: 'Ana', topic: 'api-keys' },
        headers: { 'X-API-Key' => secret }

    expect(response).to have_http_status(:ok)
    expect(JSON.parse(response.body)).to eq(
      'message' => 'Solicitud autenticada correctamente',
      'params' => { 'name' => 'Ana', 'topic' => 'api-keys' }
    )
  end

  it 'does not accept an API key from query parameters' do
    _api_key, secret = ApiKey.issue_for(user: user, name: 'Practice')

    get path, params: { name: 'Ana', api_key: secret }

    expect(response).to have_http_status(:unauthorized)
  end
end
