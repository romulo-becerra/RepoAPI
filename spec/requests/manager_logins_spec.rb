require "rails_helper"

RSpec.describe "Manager::Logins API", type: :request do
  let(:manager) { create(:user, role: :manager, pin: "1234") }
  let!(:manager_account) { create(:account, user: manager) }
  let(:customer) { create(:user, pin: "1234") }
  let!(:customer_account) { create(:account, user: customer) }
  let(:headers) do
    {
      "Authorization" => "Bearer #{JsonWebToken.encode(user_id: manager.id)}",
      "Content-Type" => "application/json"
    }
  end

  describe "GET /api/v1/manager/logins" do
    it "requires manager access" do
      customer_headers = { "Authorization" => "Bearer #{JsonWebToken.encode(user_id: customer.id)}" }

      get "/api/v1/manager/logins", headers: customer_headers, as: :json

      expect(response).to have_http_status(:forbidden)
    end

    it "filters by day and status and paginates" do
      day = Time.zone.parse("2026-09-29 12:00:00")
      7.times do
        LoginEvent.create!(user: customer, account_number: customer_account.account_number, user_name: customer.to_s, status: :success, created_at: day)
      end
      LoginEvent.create!(user: customer, account_number: customer_account.account_number, user_name: customer.to_s, status: :failure, created_at: day)
      LoginEvent.create!(user: customer, account_number: customer_account.account_number, user_name: customer.to_s, status: :success, created_at: day - 1.day)

      get "/api/v1/manager/logins?period=day&date=2026-09-29&status=success&per_page=5", headers: headers, as: :json

      expect(response).to have_http_status(:ok), response.body
      body = JSON.parse(response.body)
      expect(body["total"]).to eq(7)
      expect(body["page"]).to eq(1)
      expect(body["total_pages"]).to eq(2)
      expect(body["has_next"]).to eq(true)
      expect(body["totals_by_status"]["success"]).to eq(7)
      expect(body["logins"].length).to eq(5)
      expect(body["logins"]).to all(include("status" => "success", "user_id" => customer.id))
      expect(response.body).not_to include("1234", "token")
    end

    it "supports week and month ranges" do
      LoginEvent.create!(user: customer, account_number: customer_account.account_number, user_name: customer.to_s, status: :success, created_at: Time.zone.parse("2026-09-01 10:00:00"))
      LoginEvent.create!(user: customer, account_number: customer_account.account_number, user_name: customer.to_s, status: :blocked, created_at: Time.zone.parse("2026-08-31 23:00:00"))

      get "/api/v1/manager/logins?period=week&date=2026-09-01", headers: headers, as: :json

      expect(response).to have_http_status(:ok), response.body
      expect(JSON.parse(response.body)["total"]).to eq(2)

      get "/api/v1/manager/logins?period=month&date=2026-09-15", headers: headers, as: :json

      expect(response).to have_http_status(:ok), response.body
      expect(JSON.parse(response.body)["total"]).to eq(1)
    end

    it "preserves login history when a user is deleted" do
      event = LoginEvent.create!(user: customer, account_number: customer_account.account_number, user_name: customer.to_s, status: :success)

      customer.destroy!

      expect(event.reload.user_id).to be_nil
      expect(event.user_name).to be_present
      expect(event.account_number).to eq(customer_account.account_number)
    end
  end

  describe "GET /api/v1/manager/logins/download" do
    it "downloads a CSV report with login identity and status" do
      LoginEvent.create!(user: customer, account_number: customer_account.account_number, user_name: customer.to_s, status: :success)

      get "/api/v1/manager/logins/download?period=month&date=#{Date.current.iso8601}", headers: headers

      expect(response).to have_http_status(:ok)
      expect(response.media_type).to eq("text/csv")
      expect(response.headers["Content-Disposition"]).to include("attachment", "user_logins_month")
      expect(response.body).to include("created_at,status,user_id,user_name,account_number")
      expect(response.body).to include(customer_account.account_number, customer.to_s, "success")
      expect(response.body).not_to include("1234", "Bearer")
    end
  end
end
