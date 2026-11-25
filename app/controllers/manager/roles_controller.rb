module Manager
  class RolesController < ApplicationController
    before_action :require_manager!

    ROLE_PERMISSIONS = {
      "super_admin" => %w[all],
      "admin" => %w[users accounts transactions loans reports reconciliation accounting invoices audit],
      "financial_manager" => %w[accounts transactions loans reports reconciliation invoices],
      "accountant" => %w[accounting reconciliations reports invoices],
      "auditor" => %w[audit reports logins operations],
      "cashier" => %w[accounts deposits withdrawals service_payments],
      "customer_service" => %w[clients accounts tickets cards documents credit_requests digital_banking],
      "supervisor" => %w[accounts transactions loans reports users],
      "customer" => %w[self_service]
    }.freeze

    def index
      render json: ROLE_PERMISSIONS.map { |role, permissions|
        { name: role, permissions: permissions }
      }, status: :ok
    end
  end
end
