class AccountReconciliationsController < ApplicationController
  before_action :require_manager!

  def create
    account = Account.find_by(id: params[:account_id])
    return render json: { errors: "Cuenta no encontrada" }, status: :not_found unless account

    reported = BigDecimal(params[:reported_balance].to_s)
    calculated = account.balance
    difference = reported - calculated

    reconciliation = AccountReconciliation.create!(
      account: account,
      created_by: current_user,
      reported_balance: reported,
      calculated_balance: calculated,
      difference: difference,
      status: difference.zero? ? :reconciled : :discrepancy,
      notes: params[:notes],
      reconciled_at: Time.current
    )

    AuditLog.record!(
      action: "reconciliation",
      auditable: reconciliation,
      new_values: reconciliation.attributes,
      reason: params[:notes]
    )

    render json: {
      id: reconciliation.id,
      account_id: account.id,
      reported_balance: reported.to_f,
      calculated_balance: calculated.to_f,
      difference: difference.to_f,
      status: reconciliation.status
    }, status: :created
  rescue ArgumentError
    render json: { errors: "Saldo reportado inválido" }, status: :unprocessable_entity
  end

  def index
    reconciliations = AccountReconciliation.includes(:account).order(created_at: :desc)
    reconciliations = reconciliations.where(account_id: params[:account_id]) if params[:account_id].present?

    render json: reconciliations.map { |item|
      {
        id: item.id,
        account_id: item.account_id,
        reported_balance: item.reported_balance.to_f,
        calculated_balance: item.calculated_balance.to_f,
        difference: item.difference.to_f,
        status: item.status,
        notes: item.notes,
        reconciled_at: item.reconciled_at
      }
    }, status: :ok
  end
end
