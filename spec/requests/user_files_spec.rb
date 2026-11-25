require 'rails_helper'

RSpec.describe 'User files API', type: :request do
  def auth_headers(user)
    { 'Authorization' => "Bearer #{JsonWebToken.encode(user_id: user.id)}" }
  end

  %i[customer cashier manager admin].each do |role|
    it "allows #{role} to upload a file to their own account" do
      user = create(:user, role: role)
      upload = Rack::Test::UploadedFile.new(
        StringIO.new('account document'),
        'text/plain',
        original_filename: 'account-document.txt'
      )

      post "/api/v1/users/#{user.id}/files", params: { file: upload }, headers: auth_headers(user)

      expect(response).to have_http_status(:created)
      expect(JSON.parse(response.body).dig('file', 'original_filename')).to eq('account-document.txt')
      expect(user.user_files.last.uploaded_by_user_id).to eq(user.id)
    ensure
      FileUtils.rm_rf(Rails.root.join('storage', 'user_uploads', user.id.to_s)) if user&.persisted?
    end
  end

  it 'prevents a customer from accessing another user files' do
    owner = create(:user, email: 'file.owner@example.com')
    viewer = create(:user, email: 'file.viewer@example.com')

    get "/api/v1/users/#{owner.id}/files", headers: auth_headers(viewer)

    expect(response).to have_http_status(:forbidden)
  end
end
