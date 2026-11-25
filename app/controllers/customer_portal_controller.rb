require "csv"

class CustomerPortalController < ApplicationController
  def dashboard
    accounts = current_user.accounts.includes(:transactions)
    transactions = Transaction.where(account: accounts).completed
    month = Time.current.beginning_of_month..Time.current.end_of_month
    month_transactions = transactions.where(created_at: month)

    render json: {
      total_balance: accounts.sum(:balance).to_f,
      available_balance: accounts.where(status: 0).sum(:balance).to_f,
      retained_balance: accounts.sum(:retained_balance).to_f,
      income_month: month_transactions.where(transaction_type: %i[deposit atm_deposit]).sum(:amount).to_f,
      expenses_month: month_transactions.where(transaction_type: %i[withdraw transfer service_payment loan_payment atm_withdrawal]).sum(:amount).to_f,
      accounts: accounts.map { |account|
        { id: account.id, account_number: account.account_number, account_category: account.account_category, balance: account.balance.to_f, retained_balance: account.retained_balance.to_f, status: account.status }
      },
      recent_transactions: transactions.order(created_at: :desc).limit(10).map { |transaction|
        { id: transaction.id, type: transaction.transaction_type, amount: transaction.amount.to_f, status: transaction.status, created_at: transaction.created_at }
      },
      notifications: current_user.notifications.order(created_at: :desc).limit(10).map { |notification|
        { id: notification.id, title: notification.title, message: notification.message, channel: notification.channel, read_at: notification.read_at, created_at: notification.created_at }
      }
    }, status: :ok
  end

  def transactions
    account_ids = current_user.accounts.select(:id)
    scope = Transaction.where(account_id: account_ids).order(created_at: :desc)
    scope = scope.where(created_at: Date.parse(params[:from]).beginning_of_day..Date.parse(params[:to]).end_of_day) if params[:from].present? && params[:to].present?
    scope = scope.where("amount >= ?", BigDecimal(params[:min_amount].to_s)) if params[:min_amount].present?
    scope = scope.where("amount <= ?", BigDecimal(params[:max_amount].to_s)) if params[:max_amount].present?

    if params[:format].to_s == "csv"
      csv_data = CSV.generate(headers: true) do |csv|
        csv << %w[id fecha tipo monto estado cuenta]
        scope.find_each do |transaction|
          csv << [transaction.id, transaction.created_at, transaction.transaction_type, transaction.amount.to_f, transaction.status, transaction.account.account_number]
        end
      end
      send_data csv_data, filename: "mis_movimientos.csv", type: "text/csv"
      return
    end

    render json: {
      transactions: scope.limit(200).map { |transaction|
        { id: transaction.id, account_number: transaction.account.account_number, type: transaction.transaction_type, amount: transaction.amount.to_f, balance_before: transaction.balance_before&.to_f, balance_after: transaction.balance_after&.to_f, status: transaction.status, created_at: transaction.created_at }
      }
    }, status: :ok
  rescue ArgumentError
    render json: { errors: "Filtros de fecha o monto inválidos" }, status: :unprocessable_entity
  end

  def statement
    account = current_user.accounts.find(params[:account_id])
    transactions = account.transactions.order(created_at: :desc)
    csv_data = CSV.generate(headers: true) do |csv|
      csv << %w[id fecha tipo monto saldo_anterior saldo_nuevo estado]
      transactions.find_each do |transaction|
        csv << [transaction.id, transaction.created_at, transaction.transaction_type, transaction.amount.to_f, transaction.balance_before&.to_f, transaction.balance_after&.to_f, transaction.status]
      end
    end
    send_data csv_data, filename: "estado_cuenta_#{account.account_number}.csv", type: "text/csv"
  rescue ActiveRecord::RecordNotFound
    render json: { errors: "Cuenta no encontrada" }, status: :not_found
  end

  def credit_requests
    requests = current_user.credit_requests.order(created_at: :desc)
    render json: requests.map { |request|
      { id: request.id, amount: request.amount.to_f, term_months: request.term_months, status: request.status, reason: request.reason, created_at: request.created_at }
    }, status: :ok
  end

  def create_credit_request
    account = current_user.accounts.find(params[:account_id])
    request = current_user.credit_requests.create!(
      account: account,
      amount: params[:amount],
      term_months: params[:term_months],
      reason: params[:reason]
    )
    AuditLog.record!(action: "customer_credit_request", auditable: request)
    render json: { id: request.id, status: request.status }, status: :created
  rescue ActiveRecord::RecordNotFound
    render json: { errors: "Cuenta no encontrada" }, status: :not_found
  rescue ActiveRecord::RecordInvalid => error
    render json: { errors: error.record.errors.full_messages }, status: :unprocessable_entity
  end

  def tickets
    render json: current_user.support_tickets.order(created_at: :desc).map { |ticket|
      { id: ticket.id, subject: ticket.subject, description: ticket.description, status: ticket.status, priority: ticket.priority, created_at: ticket.created_at }
    }, status: :ok
  end

  def create_ticket
    ticket = current_user.support_tickets.create!(subject: params[:subject], description: params[:description])
    render json: { id: ticket.id, status: ticket.status }, status: :created
  rescue ActiveRecord::RecordInvalid => error
    render json: { errors: error.record.errors.full_messages }, status: :unprocessable_entity
  end

  def preferences
    preference = current_user.user_preference || current_user.create_user_preference!
    render json: preference, status: :ok
  end

  def update_preferences
    preference = current_user.user_preference || current_user.build_user_preference
    theme = params[:theme].presence || preference.theme
    unless %w[light dark].include?(theme)
      return render json: { errors: "Tema no válido" }, status: :unprocessable_entity
    end

    preference.update!(
      language: preference.language,
      preferred_currency: preference.preferred_currency,
      timezone: preference.timezone,
      theme: theme
    )
    render json: preference, status: :ok
  rescue ActiveRecord::RecordInvalid => error
    render json: { errors: error.record.errors.full_messages }, status: :unprocessable_entity
  end

  def notifications
    render json: current_user.notifications.order(created_at: :desc).limit(100).map { |notification|
      { id: notification.id, title: notification.title, message: notification.message, channel: notification.channel, read_at: notification.read_at, created_at: notification.created_at }
    }, status: :ok
  end

  def mark_notification_read
    notification = current_user.notifications.find(params[:id])
    notification.update!(read_at: Time.current)
    render json: { id: notification.id, read_at: notification.read_at }, status: :ok
  rescue ActiveRecord::RecordNotFound
    render json: { errors: "Notificación no encontrada" }, status: :not_found
  end
end
