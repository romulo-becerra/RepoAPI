# frozen_string_literal: true

module ApiTestFramework
  class Session
    attr_reader :client, :token, :user, :account

    def initialize(client: Client.new)
      @client = client
    end

    def register(first_name:, last_name:, email:, pin:, phone: nil)
      payload = { first_name: first_name, last_name: last_name, email: email, pin: pin }
      payload[:phone] = phone if phone
      response = client.post("/api/v1/register", body: payload)
      store_auth(response)
      response
    end

    def login(account_number:, pin:)
      response = client.post("/api/v1/login", body: { account_number: account_number, pin: pin })
      store_auth(response)
      response
    end

    def authenticated_client
      raise Error, "No auth token in session. Register or login first." unless token

      client.with_token(token)
    end

    private

    def store_auth(response)
      return unless response.success?

      @token = response["token"]
      @user = response["user"]
      @account = response["account"]
    end
  end
end
