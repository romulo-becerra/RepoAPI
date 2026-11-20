module Manager
  class AccountOperationsController < ApplicationController
    before_action :require_operations_staff!
    before_action :set_account

    def summary
      loans = @account.loans.order(created_at: :desc)
      active_loan = loans.find(&:active?)

      render json: {
        account_id: @account.id,
        account_number: @account.account_number,
        user_id: @account.user_id,
        user_name: @account.user ? "#{@account.user.first_name} #{@account.user.last_name}".strip : nil,
        balance: @account.balance.to_f,
        active_loan_id: active_loan&.id,
        loans: loans.map do |loan|
          {
            id: loan.id,
            amount: loan.amount.to_f,
            annual_interest_rate: loan.annual_interest_rate.to_f,
            term_months: loan.term_months,
            monthly_payment: loan.monthly_payment.to_f,
            outstanding_principal: loan.outstanding_principal.to_f,
            status: loan.status,
            first_due_date: loan.first_due_date
          }
        end
      }, status: :ok
    end

    def deposit
      transaction = TransactionService.new.deposit!(
        @account,
        params[:amount],
        params[:description].presence || "Deposito aplicado por gerente",
        performed_by_role: current_user.role,
        performed_by_user_id: current_user.id,
        performed_by_name: current_user.to_s
      )
      create_receipt(transaction, "deposit", "Depósito en efectivo")

      render json: {
        message: "Deposito aplicado por #{current_user.role}",
        account_id: @account.id,
        user_id: @account.user_id,
        balance: @account.reload.balance,
        transaction_id: transaction.id,
        transaction_type: transaction.transaction_type,
        amount: transaction.amount.to_f
      }, status: :ok
    rescue InvalidAmountError, StandardError => e
      render json: { errors: e.message }, status: :unprocessable_entity
    end

    def withdraw
      transaction = TransactionService.new.withdraw!(
        @account,
        params[:amount],
        params[:description].presence || "Retiro aplicado por gerente",
        performed_by_role: current_user.role,
        performed_by_user_id: current_user.id,
        performed_by_name: current_user.to_s
      )
      create_receipt(transaction, "withdraw", "Retiro en efectivo")

      render json: {
        message: "Retiro aplicado por #{current_user.role}",
        account_id: @account.id,
        user_id: @account.user_id,
        balance: @account.reload.balance,
        transaction_id: transaction.id,
        transaction_type: transaction.transaction_type,
        amount: transaction.amount.to_f
      }, status: :ok
    rescue InsufficientFundsError => e
      render json: { errors: e.message }, status: :payment_required
    rescue InvalidAmountError, StandardError => e
      render json: { errors: e.message }, status: :unprocessable_entity
    end

    def pay_service
      service = Service.includes(:account).find_by(id: params[:service_id])
      return render json: { errors: "Servicio no encontrado" }, status: :not_found unless service

      transaction = TransactionService.new.transfer!(
        @account,
        service.account,
        params[:amount],
        params[:description].presence || "Pago de servicio aplicado por #{current_user.role}",
        performed_by_role: current_user.role,
        performed_by_user_id: current_user.id,
        performed_by_name: current_user.to_s
      )
      create_receipt(transaction, "service_payment", "Pago de servicio")

      render json: {
        message: "Pago de servicio aplicado",
        account_id: @account.id,
        user_id: @account.user_id,
        balance: @account.reload.balance,
        transaction_id: transaction.id,
        transaction_type: transaction.transaction_type,
        amount: transaction.amount.to_f
      }, status: :ok
    rescue InsufficientFundsError => error
      render json: { errors: error.message }, status: :payment_required
    rescue InvalidAmountError, InvalidTransactionError => error
      render json: { errors: error.message }, status: :unprocessable_entity
    end

    def pay_loan
      loan = @account.loans.find_by(id: params[:loan_id])
      return render json: { errors: "Préstamo no encontrado para la cuenta" }, status: :not_found unless loan

      payment_result = LoanService.apply_payment!(
        loan,
        amount: params[:amount],
        paid_on: params[:paid_on],
        performed_by_role: current_user.role,
        performed_by_user_id: current_user.id,
        performed_by_name: current_user.to_s
      )
      create_receipt(transaction, "loan_payment", "Pago de préstamo")

      render json: {
        message: "Pago de préstamo aplicado por #{current_user.role}",
        account_id: @account.id,
        user_id: @account.user_id,
        account_balance: @account.reload.balance,
        loan_id: loan.id,
        payment: payment_result,
        loan_status: loan.reload.status,
        outstanding_principal: loan.outstanding_principal.to_f
      }, status: :ok
    rescue InsufficientFundsError => e
      render json: { errors: e.message }, status: :payment_required
    rescue LoanService::LoanError => e
      render json: { errors: e.message }, status: :unprocessable_entity
    rescue StandardError => e
      render json: { errors: e.message }, status: :unprocessable_entity
    end

    def update_limits
      withdraw_limit = params[:daily_withdraw_limit].presence
      transfer_limit = params[:daily_transfer_limit].presence

      @account.update!(
        daily_withdraw_limit: withdraw_limit,
        daily_transfer_limit: transfer_limit
      )
      AuditLog.record!(
        action: "update_account_limits",
        auditable: @account,
        new_values: @account.attributes.slice("daily_withdraw_limit", "daily_transfer_limit")
      )

      render json: {
        account_id: @account.id,
        daily_withdraw_limit: @account.daily_withdraw_limit&.to_f,
        daily_transfer_limit: @account.daily_transfer_limit&.to_f
      }, status: :ok
    end

    def update_status
      status = params[:status].to_s
      return render json: { errors: "Estado no válido" }, status: :unprocessable_entity unless %w[active frozen closed].include?(status)

      @account.status = status
      @account.save!
      AuditLog.record!(action: "update_account_status", auditable: @account, reason: params[:reason])

      render json: { account_id: @account.id, status: @account.status }, status: :ok
    end

    private

    def create_receipt(transaction, operation, description)
      receipt_number = "RC-#{Time.current.strftime('%Y%m%d')}-#{SecureRandom.hex(5).upcase}"
      Receipt.create!(
        account: transaction.account,
        financial_transaction: transaction,
        created_by: current_user,
        receipt_number: receipt_number,
        operation: operation,
        amount: transaction.amount,
        description: params[:description].presence || description
      )
    end

    def set_account
      lookup = params[:account_id].to_s.strip
      @account = Account.find_by(id: lookup)
      @account ||= Account.find_by(account_number: lookup)
      return if @account

      render json: { errors: "Cuenta no encontrada" }, status: :not_found
    end
  end
end
