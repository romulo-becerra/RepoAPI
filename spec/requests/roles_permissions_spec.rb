require 'rails_helper'

# End-to-end coverage for the role matrix:
#   admin   -> full control (user lifecycle, roles, inquiries, loans, reports, counter ops)
#   manager -> management (inquiries, loan origination, reports, counter ops)
#   cashier -> counter ops only (deposit / withdraw / loan payment / service payment)
#   customer -> self service (withdraw, service payment, loan payment, transfer)
RSpec.describe 'Role permission matrix', type: :request do
  let(:admin) { create(:user, role: :admin, pin: '1234') }
  let(:manager) { create(:user, role: :manager, pin: '1234') }
  let(:cashier) { create(:user, role: :cashier, pin: '1234') }
  let(:customer) { create(:user, pin: '1234') }

  let!(:admin_account) { create(:account, user: admin, account_number: '9000000101', balance: 10_000) }
  let!(:manager_account) { create(:account, user: manager, account_number: '9000000102', balance: 10_000) }
  let!(:cashier_account) { create(:account, user: cashier, account_number: '9000000103', balance: 10_000) }
  let!(:customer_account) { create(:account, user: customer, account_number: '9000000104', balance: 5_000) }

  let(:other_customer) { create(:user, pin: '1234') }
  let!(:other_account) { create(:account, user: other_customer, account_number: '9000000200', balance: 1_000) }

  let(:service_account) { create(:account, account_type: :service, account_number: '9000000300', balance: 0) }
  let!(:water_service) { Service.create!(name: 'Agua Test', description: 'Pago de agua', account: service_account) }

  def auth(user)
    {
      'Authorization' => "Bearer #{JsonWebToken.encode(user_id: user.id)}",
      'Content-Type' => 'application/json'
    }
  end

  def last_actor_tag
    Transaction.order(:id).last.description.to_s[/\[actor:[a-z_]+#\d+/]
  end

  describe 'counter operations on a target account (staff)' do
    %i[admin manager cashier].each do |role|
      it "allows a #{role} to deposit and records the acting role" do
        post "/api/v1/manager/accounts/#{customer_account.id}/deposit",
             params: { amount: 250, description: 'Deposito en ventanilla' },
             headers: auth(public_send(role)),
             as: :json

        expect(response).to have_http_status(:ok), response.body
        expect(customer_account.reload.balance).to eq(5_250)
        expect(last_actor_tag).to eq("[actor:#{role}##{public_send(role).id}")
      end
    end

    it 'lets a cashier withdraw from a target account' do
      post "/api/v1/manager/accounts/#{customer_account.id}/withdraw",
           params: { amount: 100, description: 'Retiro en ventanilla' },
           headers: auth(cashier),
           as: :json

      expect(response).to have_http_status(:ok), response.body
      expect(customer_account.reload.balance).to eq(4_900)
    end

    it 'lets a cashier pay a service for a target account' do
      post "/api/v1/manager/accounts/#{customer_account.id}/pay_service",
           params: { service_id: water_service.id, amount: 200, description: 'Pago de servicio' },
           headers: auth(cashier),
           as: :json

      expect(response).to have_http_status(:ok), response.body
      expect(customer_account.reload.balance).to eq(4_800)
      expect(service_account.reload.balance).to eq(200)
    end

    it 'lets a manager pay an installment of the target loan' do
      loan = LoanService.new(customer_account, amount: 1_200, term_months: 6,
                                              first_due_date: Date.current.next_month).create_loan!
      # create_loan! disburses the principal, so the balance grows before the payment.
      expect(customer_account.reload.balance).to eq(6_200)

      post "/api/v1/manager/accounts/#{customer_account.id}/loans/#{loan.id}/pay",
           params: { amount: 200 },
           headers: auth(manager),
           as: :json

      expect(response).to have_http_status(:ok), response.body
      expect(customer_account.reload.balance).to eq(6_000)
    end

    it 'accepts the account number as the target lookup' do
      post "/api/v1/manager/accounts/#{customer_account.account_number}/deposit",
           params: { amount: 50 },
           headers: auth(admin),
           as: :json

      expect(response).to have_http_status(:ok), response.body
      expect(customer_account.reload.balance).to eq(5_050)
    end

    it 'forbids a customer from the staff counter endpoints' do
      %W[deposit withdraw pay_service].each do |action|
        post "/api/v1/manager/accounts/#{customer_account.id}/#{action}",
             params: { amount: 10, service_id: water_service.id },
             headers: auth(customer),
             as: :json

        expect(response).to have_http_status(:forbidden), "#{action}: #{response.body}"
      end
    end
  end

  describe 'client self-service endpoints' do
    it 'forbids a customer from depositing through the client endpoint' do
      post "/api/v1/accounts/#{customer_account.id}/deposit",
           params: { amount: 100 },
           headers: auth(customer),
           as: :json

      expect(response).to have_http_status(:forbidden)
      expect(JSON.parse(response.body)['errors']).to include('clientes')
      expect(customer_account.reload.balance).to eq(5_000)
    end

    it 'still allows a customer to withdraw and pay a service' do
      post "/api/v1/accounts/#{customer_account.id}/withdraw",
           params: { amount: 500 },
           headers: auth(customer),
           as: :json
      expect(response).to have_http_status(:ok), response.body

      post "/api/v1/accounts/#{customer_account.id}/pay_service",
           params: { service_id: water_service.id, amount: 300 },
           headers: auth(customer),
           as: :json
      expect(response).to have_http_status(:ok), response.body

      expect(customer_account.reload.balance).to eq(4_200)
    end
  end

  describe 'transfers' do
    it 'lets a customer transfer to a recipient account number' do
      post "/api/v1/accounts/#{customer_account.id}/transfer",
           params: { recipient_account_number: other_account.account_number, amount: 400, description: 'Envio' },
           headers: auth(customer),
           as: :json

      expect(response).to have_http_status(:ok), response.body
      body = JSON.parse(response.body)
      expect(body.dig('recipient_account', 'account_number')).to eq(other_account.account_number)
      expect(customer_account.reload.balance).to eq(4_600)
      expect(other_account.reload.balance).to eq(1_400)
    end

    it 'rejects an unknown destination account' do
      post "/api/v1/accounts/#{customer_account.id}/transfer",
           params: { recipient_account_number: '0000000000', amount: 100 },
           headers: auth(customer),
           as: :json

      expect(response).to have_http_status(:not_found)
      expect(customer_account.reload.balance).to eq(5_000)
    end

    it 'rejects a service account as destination' do
      post "/api/v1/accounts/#{customer_account.id}/transfer",
           params: { recipient_account_number: service_account.account_number, amount: 100 },
           headers: auth(customer),
           as: :json

      expect(response).to have_http_status(:not_found)
    end

    it 'rejects a transfer that exceeds the available balance' do
      post "/api/v1/accounts/#{customer_account.id}/transfer",
           params: { recipient_account_number: other_account.account_number, amount: 99_999 },
           headers: auth(customer),
           as: :json

      expect(response).to have_http_status(:unprocessable_entity)
      expect(other_account.reload.balance).to eq(1_000)
    end
  end

  describe 'loan origination' do
    let(:loan_params) do
      { amount: 1_500, term_months: 6, first_due_date: Date.current.next_month.to_s }
    end

    %i[admin manager].each do |role|
      it "lets a #{role} originate a loan" do
        post "/api/v1/manager/accounts/#{customer_account.id}/loans",
             params: loan_params,
             headers: auth(public_send(role)),
             as: :json

        expect(response).to have_http_status(:created), response.body
        expect(customer_account.loans.count).to eq(1)
      end
    end

    it 'forbids a cashier from originating a loan' do
      post "/api/v1/manager/accounts/#{customer_account.id}/loans",
           params: loan_params,
           headers: auth(cashier),
           as: :json

      expect(response).to have_http_status(:forbidden)
      expect(customer_account.loans.count).to eq(0)
    end

    it 'forbids a customer from the client loan endpoint' do
      post "/api/v1/accounts/#{customer_account.id}/loans",
           params: loan_params.merge(account_id: customer_account.id),
           headers: auth(customer),
           as: :json

      expect(response).to have_http_status(:forbidden)
      expect(customer_account.loans.count).to eq(0)
    end
  end

  describe 'account and loan inquiry' do
    it 'lets admin and manager read the account summary' do
      %i[admin manager].each do |role|
        get "/api/v1/manager/accounts/#{customer_account.id}/summary",
            headers: auth(public_send(role)),
            as: :json

        expect(response).to have_http_status(:ok), "#{role}: #{response.body}"
      end
    end

    it 'forbids a cashier from the account summary' do
      get "/api/v1/manager/accounts/#{customer_account.id}/summary",
          headers: auth(cashier),
          as: :json

      expect(response).to have_http_status(:forbidden)
    end
  end

  describe 'reporting endpoints' do
    %i[operations logins].each do |report|
      it "rejects a cashier from the #{report} report" do
        get "/api/v1/manager/#{report}", headers: auth(cashier), as: :json

        expect(response).to have_http_status(:forbidden)
      end

      it "rejects a customer from the #{report} report" do
        get "/api/v1/manager/#{report}", headers: auth(customer), as: :json

        expect(response).to have_http_status(:forbidden)
      end

      it "allows a manager to read the #{report} report" do
        get "/api/v1/manager/#{report}", headers: auth(manager), as: :json

        expect(response).to have_http_status(:ok), response.body
      end
    end
  end

  describe 'role helpers' do
    it 'keeps staff and management predicates aligned with the matrix' do
      expect(admin.staff?).to eq(true)
      expect(admin.management?).to eq(true)

      expect(manager.staff?).to eq(true)
      expect(manager.management?).to eq(true)

      expect(cashier.staff?).to eq(true)
      expect(cashier.management?).to eq(false)

      expect(customer.staff?).to eq(false)
      expect(customer.management?).to eq(false)
    end
  end
end
