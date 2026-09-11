# frozen_string_literal: true

RSpec.describe "Health", type: :api do
  let(:client) { ApiTestFramework::Client.new }

  it "GET /up returns success" do
    response = client.get("/up")

    expect(response).to have_http_status(200)
    expect(response).to be_success
  end

  it "GET / reports the API is running" do
    response = client.get("/")

    expect(response).to have_http_status(200)
    expect(response).to have_json_keys("status", "service", "message")
    expect(response["status"]).to eq("ok")
  end
end
