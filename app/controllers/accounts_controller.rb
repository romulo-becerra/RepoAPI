class AccountsController < ApplicationController
  def index
    @accounts = current_user.accounts
  end

  def show
    @account = current_user.accounts.find_by(id: params[:id])
    return render json: { errors: "Cuenta no encontrada" }, status: :not_found unless @account

    active_loan = @account.loans.active.includes(:loan_installments).order(created_at: :desc).first
    render json: {
      id: @account.id,
      user_id: @account.user_id,
      account_number: @account.account_number,
      clabe: @account.clabe,
      balance: @account.balance,
      loan: active_loan ? {
        id: active_loan.id,
        has_active_loan: true,
        total_loan_amount: active_loan.amount.to_f,
        annual_interest_rate: active_loan.annual_interest_rate.to_f,
        term_months: active_loan.term_months,
        monthly_payment: active_loan.monthly_payment.to_f,
        first_due_date: active_loan.first_due_date,
        outstanding_principal: active_loan.outstanding_principal.to_f,
        paid_installments_count: active_loan.paid_installments_count,
        pending_installments_count: active_loan.pending_installments_count
      } : {
        has_active_loan: false
      }
    }, status: :ok
  end

  def create
    @account = @current_user.accounts.build

    if @account.save
      render json: @account, status: :created
    else
      render json: @account.errors, status: :unprocessable_entity
    end
  end

  def transfer
    @source_account = current_user.accounts.find_by(id: params[:id])
    return render json: { errors: "Cuenta de origen no encontrada" }, status: :not_found unless @source_account

    recipient_account = Account.find(params[:recipient_account_id])
    @amount = params[:amount].to_d
    description = params[:description]

    perform_transfer(@source_account, recipient_account, @amount, description)
  end

  def pay_service
    @source_account = current_user.accounts.find_by(id: params[:id])
    return render json: { errors: "Cuenta de origen no encontrada" }, status: :not_found unless @source_account

    begin
      service = Service.find(params[:service_id])
    rescue ActiveRecord::RecordNotFound
      return render json: { errors: "Servicio no encontrado" }, status: :not_found
    end

    @amount = params[:amount].to_d
    description = params[:description]

    perform_transfer(@source_account, service.account, @amount, description)
  end

  def balance
    @account = current_user.accounts.find_by(id: params[:id])
    return render json: { errors: "Cuenta no encontrada" }, status: :not_found unless @account

    render json: { account_id: @account.id, balance: @account.balance }, status: :ok
  end

  def summary
    @account = current_user.accounts.find_by(id: params[:id])
    return render json: { errors: "Cuenta no encontrada" }, status: :not_found unless @account

    transactions = @account.transactions.where(status: :completed)
    income = transactions.where(transaction_type: %i[deposit atm_deposit]).sum(&:amount)
    expense = transactions.where(transaction_type: %i[withdraw transfer service_payment loan_payment atm_withdrawal]).sum(&:amount)

    render json: {
      account_id: @account.id,
      balance: @account.balance,
      income: income,
      expense: expense,
      month: Date.current.strftime("%Y-%m")
    }, status: :ok
  end

  def deposit
    account = current_user.accounts.find_by(id: params[:id])
    return render json: { errors: "Cuenta no encontrada" }, status: :not_found unless account

    transaction = TransactionService.new.deposit!(
      account,
      params[:amount],
      params[:description].presence || "Deposito en cuenta"
    )

    render json: {
      message: "Deposito aplicado correctamente",
      account_id: account.id,
      balance: account.reload.balance,
      transaction_id: transaction.id,
      transaction_type: transaction.transaction_type,
      amount: transaction.amount.to_f
    }, status: :ok
  rescue InvalidAmountError, StandardError => e
    render json: { errors: e.message }, status: :unprocessable_entity
  end

  def withdraw
    account = current_user.accounts.find_by(id: params[:id])
    return render json: { errors: "Cuenta no encontrada" }, status: :not_found unless account

    transaction = TransactionService.new.withdraw!(
      account,
      params[:amount],
      params[:description].presence || "Retiro en cuenta"
    )

    render json: {
      message: "Retiro aplicado correctamente",
      account_id: account.id,
      balance: account.reload.balance,
      transaction_id: transaction.id,
      transaction_type: transaction.transaction_type,
      amount: transaction.amount.to_f
    }, status: :ok
  rescue InsufficientFundsError => e
    render json: { errors: e.message }, status: :payment_required
  rescue InvalidAmountError, StandardError => e
    render json: { errors: e.message }, status: :unprocessable_entity
  end

  private

  def account_params
    params.require(:account).permit(:user_id, :account_number, :account_type, :CLABE)
  end

  def perform_transfer(source_account, recipient_account, amount, description)
    source_account.transfer!(recipient_account, amount, description)
    @recipient_account = recipient_account
    render :transfer, status: :ok
  rescue AccountNotFoundError => e
    render json: { errors: "Cuenta receptora no encontrada" }, status: :not_found
  rescue InvalidAmountError, InsufficientFundsError, InvalidTransactionError => e
    render json: { errors: e.message }, status: :unprocessable_entity
  rescue ActiveRecord::RecordNotFound
    if block_given?
      yield
    else
      render json: { errors: "Cuenta receptora no encontrada" }, status: :not_found
    end
  rescue StandardError => e
    render json: { errors: e.message }, status: :unprocessable_entity
  end
end
