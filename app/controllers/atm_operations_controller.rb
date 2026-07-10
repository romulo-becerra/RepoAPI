class AtmOperationsController < ApplicationController
  before_action :set_account
  before_action :validate_pin!

  def deposit
    transaction = TransactionService.new.deposit!(
      @account,
      params[:amount],
      params[:description].presence || "Deposito por cajero",
      transaction_type: :atm_deposit
    )

    render json: {
      message: "Deposito por cajero aplicado",
      account_id: @account.id,
      balance: @account.reload.balance,
      transaction_id: transaction.id,
      amount: transaction.amount.to_f
    }, status: :ok
  rescue InvalidAmountError, StandardError => e
    render json: { errors: e.message }, status: :unprocessable_entity
  end

  def withdraw
    transaction = TransactionService.new.withdraw!(
      @account,
      params[:amount],
      params[:description].presence || "Retiro por cajero",
      transaction_type: :atm_withdrawal
    )

    render json: {
      message: "Retiro por cajero aplicado",
      account_id: @account.id,
      balance: @account.reload.balance,
      transaction_id: transaction.id,
      amount: transaction.amount.to_f
    }, status: :ok
  rescue InsufficientFundsError => e
    render json: { errors: e.message }, status: :payment_required
  rescue InvalidAmountError, StandardError => e
    render json: { errors: e.message }, status: :unprocessable_entity
  end

  def balance
    render json: {
      account_id: @account.id,
      balance: @account.balance.to_f,
      checked_at: Time.current
    }, status: :ok
  end

  def statement
    transactions = @account.transactions.order(created_at: :desc).limit(10)

    render json: {
      account_id: @account.id,
      balance: @account.balance,
      transactions: transactions.map do |item|
        {
          id: item.id,
          type: item.transaction_type,
          status: item.status,
          amount: item.amount.to_f,
          description: item.description,
          created_at: item.created_at
        }
      end
    }, status: :ok
  end

  private

  def set_account
    @account = current_user.accounts.find_by(id: params[:id])
    return if @account

    render json: { errors: "Cuenta no encontrada" }, status: :not_found
  end

  def validate_pin!
    return if current_user.authenticate_pin(params[:pin])

    render json: { errors: "PIN inválido" }, status: :unauthorized
  end
end
