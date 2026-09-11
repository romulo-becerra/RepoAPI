# frozen_string_literal: true

RSpec.describe "Auth", type: :api do
  let(:client) { ApiTestFramework::Client.new }
  let(:session) { ApiTestFramework::Session.new(client: client) }
  let(:attrs) { UniqueUser.attributes }

  describe "POST /api/v1/register" do
    it "creates a user and returns a JWT" do
      response = session.register(**attrs)

      expect(response).to have_http_status(201)
      expect(response).to have_json_keys("message", "token", "user", "account")
      expect(response["user"]).to include("email" => attrs[:email])
      expect(session.token).to be_a(String)
    end

    it "rejects a payload without required fields" do
      response = client.post("/api/v1/register", body: { email: "incompleto@example.com" })

      expect(response).to have_http_status(422)
      expect(response).to have_json_keys("errors")
    end
  end

  describe "POST /api/v1/login" do
    before { session.register(**attrs) }

    it "logs in with account number and pin" do
      response = session.login(account_number: session.account["account_number"], pin: attrs[:pin])

      expect(response).to have_http_status(200)
      expect(response).to have_json_keys("token", "user", "account")
      expect(response["message"]).to eq("Inicio de sesión exitoso")
    end

    it "rejects an invalid pin" do
      response = client.post(
        "/api/v1/login",
        body: { account_number: session.account["account_number"], pin: "0000" }
      )

      expect(response).to have_http_status(401)
      expect(response["errors"]).to eq("Número de cuenta o PIN incorrecto")
    end
  end

  describe "POST /api/v1/logout" do
    it "requires a token" do
      response = client.post("/api/v1/logout")

      expect(response).to have_http_status(401)
    end

    it "closes the session with a valid token" do
      session.register(**attrs)
      response = session.authenticated_client.post("/api/v1/logout")

      expect(response).to have_http_status(200)
      expect(response["message"]).to eq("Sesión cerrada correctamente")
    end
  end
end
