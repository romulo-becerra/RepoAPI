class TransactionsController < ApplicationController
  before_action :set_account, only: [:index, :create]

  def index
    per_page = [params[:per_page].to_i, 1].max
    per_page = 50 if per_page > 50
    per_page = 10 if per_page.zero?

    scope = @account.transactions.order(created_at: :desc)
    scope = filter_transactions(scope, params[:transaction_filter], params[:performed_by_filter])

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
        actor_data = TransactionService.parse_actor_from_description(transaction.description)
        display_type = transaction_display_type(transaction, actor_data[:detail])
        receipt = Receipt.find_by(transaction_id: transaction.id)
        {
          id: transaction.id,
          transaction_type: transaction.transaction_type,
          display_type: display_type,
          movement_kind: movement_kind(transaction),
          amount: transaction.amount.to_f,
          description: actor_data[:detail],
          original_description: transaction.description,
          performed_by_role: actor_data[:role],
          performed_by_user_id: actor_data[:user_id],
          performed_by_name: actor_data[:name],
          performed_by_label: actor_data[:label],
          status: transaction.status,
          created_at: transaction.created_at,
          receipt_id: receipt&.id,
          receipt_number: receipt&.receipt_number
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
      @account.transfer!(
        @recipient_account,
        @amount,
        description,
        performed_by_role: :user,
        performed_by_user_id: current_user.id,
        performed_by_name: current_user.to_s
      )
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

  def filter_transactions(scope, transaction_filter, performed_by_filter)
    filter = transaction_filter.to_s
    actor_filter = performed_by_filter.to_s

    filtered_scope = scope
    unless filter.blank? || filter == "all"
      if filter == "debit"
        filtered_scope = filtered_scope.where(transaction_type: %i[withdraw transfer service_payment loan_payment atm_withdrawal])
      elsif filter == "credit"
        filtered_scope = filtered_scope.where(transaction_type: %i[deposit atm_deposit])
      elsif filter == "loan_disbursement"
        filtered_scope = filtered_scope.where(transaction_type: Transaction.transaction_types[:deposit])
                                     .where("description LIKE ?", "%Desembolso de préstamo%")
      elsif Transaction.transaction_types.key?(filter)
        filtered_scope = filtered_scope.where(transaction_type: Transaction.transaction_types[filter])
      end
    end

    return filtered_scope if actor_filter.blank? || actor_filter == "all"

    if actor_filter == "manager" || actor_filter == "admin"
      return filtered_scope.where("description LIKE ? OR description LIKE ?", "[actor:manager#%", "[actor:admin#%")
    end

    return filtered_scope.where("description LIKE ?", "[actor:cashier#%") if actor_filter == "cashier"

    if actor_filter == "user"
      return filtered_scope.where("description LIKE ?", "[actor:user#%")
    end

    filtered_scope
  end

  def movement_kind(transaction)
    return "debit" if %w[withdraw transfer service_payment loan_payment atm_withdrawal].include?(transaction.transaction_type)

    "credit"
  end

  def transaction_display_type(transaction, detail)
    normalized_detail = detail.to_s
    if transaction.deposit? && normalized_detail.include?("Desembolso de préstamo")
      return "loan_disbursement"
    end

    transaction.transaction_type
  end

  def set_account
    @account = current_user.accounts.find_by(id: params[:account_id])
    unless @account
      render json: { error: 'Cuenta no encontrada' }, status: :not_found
    end
  end

end
