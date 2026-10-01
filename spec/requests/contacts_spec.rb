require 'rails_helper'

RSpec.describe 'Contacts API', type: :request do
  def auth_headers(user)
    { 'Authorization' => "Bearer #{JsonWebToken.encode(user_id: user.id)}" }
  end

  %i[admin manager].each do |role|
    it "lets #{role} create and list personal contacts" do
      user = create(:user, role: role)

      post '/api/v1/contacts',
           params: { contact: { name: 'Rolo', phone: '1234' } },
           headers: auth_headers(user),
           as: :json

      expect(response).to have_http_status(:created)
      expect(JSON.parse(response.body).dig('contact', 'name')).to eq('Rolo')

      get '/api/v1/contacts', headers: auth_headers(user)

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body).fetch('contacts').map { |contact| contact['phone'] }).to eq([ '1234' ])
    end
  end

  %i[customer cashier].each do |role|
    it "does not allow #{role} to access contacts" do
      user = create(:user, role: role)

      get '/api/v1/contacts', headers: auth_headers(user)

      expect(response).to have_http_status(:forbidden)
    end
  end

  it 'keeps contacts private to their owner and deletes only owned contacts' do
    owner = create(:user, role: :manager)
    other_manager = create(:user, role: :manager, email: 'other.manager@example.com')
    contact = owner.contacts.create!(name: 'Rolo', phone: '1234')

    get '/api/v1/contacts', headers: auth_headers(other_manager)
    expect(JSON.parse(response.body).fetch('contacts')).to be_empty

    delete "/api/v1/contacts/#{contact.id}", headers: auth_headers(other_manager)
    expect(response).to have_http_status(:not_found)
    expect(contact.reload).to be_persisted

    delete "/api/v1/contacts/#{contact.id}", headers: auth_headers(owner)
    expect(response).to have_http_status(:ok)
    expect(Contact.exists?(contact.id)).to be(false)
  end
end
