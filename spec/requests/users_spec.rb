require 'rails_helper'

RSpec.describe 'Users API', type: :request do
  describe 'POST /register' do
    let(:valid_attributes) do
      {
        first_name: 'Juan',
        last_name: 'Perez',
        email: 'juan.perez@example.com',
        pin: '1234'
      }
    end

    let(:endpoint) { '/api/v1/register' }

    context 'when the request is valid' do
      it 'Create a new User' do
        expect {
          post endpoint, params: valid_attributes, headers: { 'Content-Type': 'application/json' }, as: :json
        }.to change(User, :count).by(1)
      end

      it 'returns status code 201' do
        post endpoint, params: valid_attributes, headers: { 'Content-Type': 'application/json' }, as: :json
        expect(response).to have_http_status(201)
      end

      it 'registers personal details and address in one request' do
        attributes = valid_attributes.merge(
          phone: '+59170000000',
          date_of_birth: '1990-04-12',
          address: {
            country: 'Bolivia',
            city: 'La Paz',
            province: 'La Paz',
            street: 'Avenida Central',
            street_number: '123',
            district: 'Centro',
            postal_code: '0001',
            reference: 'Edificio azul'
          }
        )

        post endpoint, params: attributes, headers: { 'Content-Type': 'application/json' }, as: :json

        expect(response).to have_http_status(:created)
        body = JSON.parse(response.body)
        user = User.find(body.dig('user', 'id'))
        expect(user.date_of_birth).to eq(Date.new(1990, 4, 12))
        expect(user.phone).to eq('+59170000000')
        expect(user.user_address).to have_attributes(country: 'Bolivia', city: 'La Paz', street: 'Avenida Central')
        expect(body.dig('address', 'postal_code')).to eq('0001')
        expect(body.to_s).not_to include('1234')
      end

      it 'rolls back the user if the submitted address is invalid' do
        attributes = valid_attributes.merge(address: { city: 'La Paz' })

        expect do
          post endpoint, params: attributes, headers: { 'Content-Type': 'application/json' }, as: :json
        end.not_to change(User, :count)

        expect(response).to have_http_status(:unprocessable_entity)
      end
    end
  end

  describe 'POST /login' do
    let(:user) { create(:user, pin: '1234') }
    let(:account) { create(:account, user: user) }
    let(:endpoint) { '/api/v1/login' }

    context 'with valid credentials' do
      it 'logs in successfully' do
        post endpoint, params: { account_number: account.account_number, pin: '1234' }, headers: { 'Content-Type': 'application/json' }, as: :json
        expect(response).to have_http_status(:ok)
        expect(JSON.parse(response.body)['message']).to eq('Inicio de sesión exitoso')
        expect(LoginEvent.order(:id).last).to have_attributes(
          user_id: user.id,
          account_number: account.account_number,
          user_name: user.to_s,
          status: 'success'
        )
      end

      it 'rejects login for blocked users' do
        user.update!(blocked: true)

        post endpoint, params: { account_number: account.account_number, pin: '1234' }, headers: { 'Content-Type': 'application/json' }, as: :json

        expect(response).to have_http_status(:forbidden)
        expect(JSON.parse(response.body)['errors']).to eq('Usuario bloqueado o desactivado')
        expect(LoginEvent.order(:id).last).to have_attributes(user_id: user.id, status: 'blocked')
      end

      it 'rejects login for deactivated users' do
        user.update!(active: false)

        post endpoint, params: { account_number: account.account_number, pin: '1234' }, headers: { 'Content-Type': 'application/json' }, as: :json

        expect(response).to have_http_status(:forbidden)
        expect(JSON.parse(response.body)['errors']).to eq('Usuario bloqueado o desactivado')
      end
    end

    context 'with invalid credentials' do
      it 'rejects login with incorrect PIN' do
        post endpoint, params: { account_number: account.account_number, pin: '0000' }, headers: { 'Content-Type': 'application/json' }, as: :json
        expect(response).to have_http_status(:unauthorized)
        expect(JSON.parse(response.body)['errors']).to eq('Número de cuenta o PIN incorrecto')
        expect(LoginEvent.order(:id).last).to have_attributes(user_id: user.id, status: 'failure')
      end

      it 'rejects login with incorrect account number' do
        post endpoint, params: { account_number: 'invalid', pin: '1234' }, headers: { 'Content-Type': 'application/json' }, as: :json
        expect(response).to have_http_status(:unauthorized)
        expect(JSON.parse(response.body)['errors']).to eq('Número de cuenta o PIN incorrecto')
        expect(LoginEvent.order(:id).last).to have_attributes(user_id: nil, account_number: 'invalid', status: 'failure')
      end

      it 'records a blank account-number attempt without raising a server error' do
        post endpoint, params: { account_number: '', pin: '' }, headers: { 'Content-Type': 'application/json' }, as: :json

        expect(response).to have_http_status(:unauthorized)
        expect(LoginEvent.order(:id).last).to have_attributes(user_id: nil, account_number: '-', status: 'failure')
      end
    end
  end

  describe 'PUT /update' do
    let(:user) { create(:user, pin: '1234') }
    let(:account) { create(:account, user: user) }

    context 'when the request is valid' do
      it 'updates the user' do
        post '/api/v1/login', params: { account_number: account.account_number, pin: '1234' }, headers: { 'Content-Type': 'application/json' }, as: :json
        expect(response).to have_http_status(:ok)

        response_body = JSON.parse(response.body)
        user_id = response_body['user']['id']
        token = response_body['token']

        put "/api/v1/users/#{user_id}", params: { first_name: 'Cody', last_name: 'Facilito', email: 'ayuda@codigofacilito.com' }, headers: { 'Authorization' => "Bearer #{token}", 'Content-Type': 'application/json' }, as: :json

        expect(response).to have_http_status(:ok)
        expect(JSON.parse(response.body)['user']['first_name']).to eq('Cody')
        expect(JSON.parse(response.body)['user']['last_name']).to eq('Facilito')
      end
    end
  end
end
