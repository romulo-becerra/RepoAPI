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

  it 'allows an admin to create a customer service user' do
    post '/api/v1/manager/users',
         params: {
           first_name: 'Service',
           last_name: 'Agent',
           email: 'service.agent@example.com',
           pin: '5678',
           role: 'customer_service'
         },
         headers: auth(admin).merge('HTTP_HOST' => 'localhost'),
         as: :json

    expect(response).to have_http_status(:created), response.body
    created_user = User.find_by!(email: 'service.agent@example.com')
    expect(created_user.customer_service?).to be(true)
    expect(created_user.accounts.find_by!(default: true).balance).to eq(0)
  end

  it 'authenticates a super admin on the admin-specific login endpoint' do
    account = super_admin.accounts.find_by!(default: true)

    post '/api/v1/login/admin',
         params: { account_number: account.account_number, pin: '2468' },
         as: :json

    expect(response).to have_http_status(:ok), response.body
    expect(JSON.parse(response.body).dig('user', 'role')).to eq('super_admin')
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
