module Manager
  class InvoicesController < ApplicationController
    before_action :require_manager!

    def index
      render json: Invoice.includes(:account).order(created_at: :desc).map { |invoice|
        invoice.attributes.slice("id", "invoice_number", "amount", "status", "description", "created_at").merge(account_id: invoice.account_id)
      }, status: :ok
    end

    def create
      account = Account.find(params[:account_id])
      invoice = Invoice.create!(
        account: account,
        created_by: current_user,
        invoice_number: "INV-#{Time.current.strftime('%Y%m%d')}-#{SecureRandom.hex(4).upcase}",
        amount: params[:amount],
        status: params[:status].presence || "pending",
        description: params[:description]
      )
      AuditLog.record!(action: "create_invoice", auditable: invoice)
      render json: invoice, status: :created
    rescue ActiveRecord::RecordInvalid, ActiveRecord::RecordNotFound => error
      render json: { errors: error.respond_to?(:record) ? error.record.errors.full_messages : error.message }, status: :unprocessable_entity
    end
  end
end
