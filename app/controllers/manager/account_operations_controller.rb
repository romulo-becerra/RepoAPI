module Manager
  class AccountOperationsController < ApplicationController
    before_action :require_manager!
    before_action :set_account

    def deposit
      transaction = TransactionService.new.deposit!(
        @account,
        params[:amount],
        params[:description].presence || "Deposito aplicado por gerente"
      )

      render json: {
        message: "Deposito aplicado por gerente",
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
        params[:description].presence || "Retiro aplicado por gerente"
      )

      render json: {
        message: "Retiro aplicado por gerente",
        account_id: @account.id,
        user_id: @account.user_id,
        balance: @account.reload.balance,
        transaction_id: transaction.id,
        transaction_type: transaction.transaction_type,
        amount: transaction.amount.to_f
      }, status: :ok
    rescue InvalidAmountError, InsufficientFundsError, StandardError => e
      render json: { errors: e.message }, status: :unprocessable_entity
    end

    def pay_loan
      loan = @account.loans.find_by(id: params[:loan_id])
      return render json: { errors: "Préstamo no encontrado para la cuenta" }, status: :not_found unless loan

      payment_result = LoanService.apply_payment!(
        loan,
        amount: params[:amount],
        paid_on: params[:paid_on]
      )

      render json: {
        message: "Pago de préstamo aplicado por gerente",
        account_id: @account.id,
        user_id: @account.user_id,
        account_balance: @account.reload.balance,
        loan_id: loan.id,
        payment: payment_result,
        loan_status: loan.reload.status,
        outstanding_principal: loan.outstanding_principal.to_f
      }, status: :ok
    rescue LoanService::LoanError => e
      render json: { errors: e.message }, status: :unprocessable_entity
    rescue StandardError => e
      render json: { errors: e.message }, status: :unprocessable_entity
    end

    private

    def set_account
      @account = Account.find_by(id: params[:account_id])
      return if @account

      render json: { errors: "Cuenta no encontrada" }, status: :not_found
    end
  end
end
