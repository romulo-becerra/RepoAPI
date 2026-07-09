class TransactionsController < ApplicationController
  before_action :set_account, only: [:index, :create]

  def index
    per_page = [params[:per_page].to_i, 1].max
    per_page = 50 if per_page > 50
    per_page = 10 if per_page.zero?

    scope = @account.transactions.order(created_at: :desc)
    scope = filter_transactions(scope, params[:transaction_filter])

    total = scope.count
    total_pages = (total.to_f / per_page).ceil
    total_pages = 1 if total_pages.zero?

    page = [params[:page].to_i, 1].max
    page = total_pages if page > total_pages

    @transactions = scope.offset((page - 1) * per_page).limit(per_page)

    render json: {
      account_id: @account.id,
      total: total,
      page: page,
      per_page: per_page,
      total_pages: total_pages,
      has_prev: page > 1,
      has_next: page < total_pages,
      transactions: @transactions.map do |transaction|
        {
          id: transaction.id,
          transaction_type: transaction.transaction_type,
          movement_kind: movement_kind(transaction),
          amount: transaction.amount.to_f,
          description: transaction.description,
          status: transaction.status,
          created_at: transaction.created_at
        }
      end
    }, status: :ok
  end

  def create
    @amount = params[:amount].to_f
    @recipient = current_user.recipients.find_by(id: params[:recipient_id])
    @recipient_account = @recipient.account
    description = params[:description]

    begin
      @account.transfer!(@recipient_account, @amount, description)
      render :create, status: :ok
    rescue AccountNotFoundError, InvalidTransactionError => e
      render json: { error: e.message }, status: :unprocessable_entity
    rescue InsufficientFundsError => e
      render json: { error: e.message }, status: :payment_required
    rescue StandardError => e
      Rails.logger.error "Error during transfer: #{e.message}"
      render json: { error: 'Ocurrió un error inesperado' }, status: :internal_server_error
    end
  end

  private

  def filter_transactions(scope, transaction_filter)
    filter = transaction_filter.to_s
    return scope if filter.blank? || filter == "all"

    if filter == "debit"
      return scope.where(transaction_type: %i[withdraw transfer service_payment loan_payment atm_withdrawal])
    end

    if filter == "credit"
      return scope.where(transaction_type: %i[deposit atm_deposit])
    end

    if Transaction.transaction_types.key?(filter)
      return scope.where(transaction_type: Transaction.transaction_types[filter])
    end

    scope
  end

  def movement_kind(transaction)
    return "debit" if %w[withdraw transfer service_payment loan_payment atm_withdrawal].include?(transaction.transaction_type)

    "credit"
  end

  def set_account
    @account = current_user.accounts.find_by(id: params[:account_id])
    unless @account
      render json: { error: 'Cuenta no encontrada' }, status: :not_found
    end
  end

end
