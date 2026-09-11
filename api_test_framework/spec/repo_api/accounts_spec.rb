# frozen_string_literal: true

RSpec.describe "Accounts", type: :api do
  let(:client) { ApiTestFramework::Client.new }
  let(:session) { ApiTestFramework::Session.new(client: client) }
  let(:attrs) { UniqueUser.attributes }

  before { session.register(**attrs) }

  it "lists accounts for the authenticated user" do
    response = session.authenticated_client.get("/api/v1/accounts")

    expect(response).to have_http_status(200)
    expect(response.json).to be_an(Array).or be_a(Hash)
  end

  it "rejects listing accounts without a token" do
    response = client.get("/api/v1/accounts")

    expect(response).to have_http_status(401)
  end

  it "returns the account balance" do
    login = session.login(account_number: session.account["account_number"], pin: attrs[:pin])
    account_id = login["account"]["id"]

    response = session.authenticated_client.get("/api/v1/accounts/#{account_id}/balance")

    expect(response).to have_http_status(200)
    expect(response).to have_json_keys("account_id", "balance")
    expect(response["account_id"]).to eq(account_id)
  end
end
