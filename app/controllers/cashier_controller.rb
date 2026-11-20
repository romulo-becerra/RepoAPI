class CashierController < ApplicationController
  before_action :require_operations_staff!

  def open_cash
    existing = CashRegisterSession.open.find_by(user: current_user)
    if existing
      return render json: { errors: "La caja ya está abierta", session: serialize_session(existing) }, status: :unprocessable_entity
    end

    amount = BigDecimal(params[:opening_balance].to_s)
    raise ArgumentError if amount.negative?

    session = CashRegisterSession.create!(
      user: current_user,
      opening_balance: amount,
      opened_at: Time.current
    )
    AuditLog.record!(action: "open_cash_register", auditable: session)
    render json: { session: serialize_session(session) }, status: :created
  rescue ArgumentError
    render json: { errors: "Saldo inicial inválido" }, status: :unprocessable_entity
  end

  def cash_status
    session = CashRegisterSession.open.find_by(user: current_user)
    render json: { session: session ? serialize_session(session) : nil }, status: :ok
  end

  def cash_movements
    session = CashRegisterSession.open.find_by(user: current_user)
    return render json: { movements: [] }, status: :ok unless session

    transactions = Transaction.includes(account: :user)
                              .where(created_at: session.opened_at..Time.current)
                              .where(transaction_type: %i[deposit withdraw transfer service_payment loan_payment atm_deposit atm_withdrawal])
                              .order(created_at: :desc)

    render json: {
      movements: transactions.limit(200).map { |transaction|
        {
          id: transaction.id,
          created_at: transaction.created_at,
          type: transaction.transaction_type,
          amount: transaction.amount.to_f,
          account_number: transaction.account&.account_number,
          status: transaction.status
        }
      }
    }, status: :ok
  end

  def reconciliation
    session = CashRegisterSession.open.find_by(user: current_user)
    return render json: { errors: "No hay caja abierta" }, status: :unprocessable_entity unless session

    physical = BigDecimal(params[:physical_balance].to_s)
    system_balance = calculate_system_balance(session)
    difference = physical - system_balance

    render json: {
      system_balance: system_balance.to_f,
      physical_balance: physical.to_f,
      difference: difference.to_f,
      result: if difference.zero? then "saldo_correcto" elsif difference.positive? then "sobrante" else "faltante" end
    }, status: :ok
  rescue ArgumentError
    render json: { errors: "Saldo físico inválido" }, status: :unprocessable_entity
  end

  def close_cash
    session = CashRegisterSession.open.find_by(user: current_user)
    return render json: { errors: "No hay caja abierta" }, status: :unprocessable_entity unless session

    physical = BigDecimal(params[:physical_balance].to_s)
    system_balance = calculate_system_balance(session)
    difference = physical - system_balance

    session.update!(
      closing_balance: system_balance,
      physical_balance: physical,
      difference: difference,
      status: :closed,
      closed_at: Time.current,
      notes: params[:notes].to_s.strip.presence
    )
    AuditLog.record!(action: "close_cash_register", auditable: session)

    render json: {
      session: serialize_session(session),
      system_balance: system_balance.to_f,
      physical_balance: physical.to_f,
      difference: difference.to_f,
      result: if difference.zero? then "saldo_correcto" elsif difference.positive? then "sobrante" else "faltante" end
    }, status: :ok
  rescue ArgumentError
    render json: { errors: "Saldo físico inválido" }, status: :unprocessable_entity
  end

  def daily_report
    session = CashRegisterSession.open.find_by(user: current_user)
    started_at = session&.opened_at || Time.current.beginning_of_day
    transactions = Transaction.where(created_at: started_at..Time.current).where(status: :completed)

    grouped = transactions.group(:transaction_type).count
    render json: {
      date: Date.current,
      opened_at: session&.opened_at,
      opening_balance: session&.opening_balance&.to_f || 0,
      deposits: grouped[:deposit].to_i + grouped[:atm_deposit].to_i,
      withdrawals: grouped[:withdraw].to_i + grouped[:atm_withdrawal].to_i,
      transfer_count: grouped[:transfer].to_i,
      service_payments: grouped[:service_payment].to_i,
      loan_payments: grouped[:loan_payment].to_i,
      transaction_count: transactions.count,
      total_amount: transactions.sum(:amount).to_f
    }, status: :ok
  end

  def receipts
    scope = Receipt.where(created_by: current_user).order(created_at: :desc)
    render json: { receipts: scope.limit(100).map { |receipt|
      {
        id: receipt.id,
        receipt_number: receipt.receipt_number,
        operation: receipt.operation,
        amount: receipt.amount.to_f,
        description: receipt.description,
        account_number: receipt.account&.account_number,
        created_at: receipt.created_at
      }
    } }, status: :ok
  end

  def search_clients
    query = params[:q].to_s.strip
    users = User.includes(:accounts).order(:last_name, :first_name).limit(20)
    unless query.blank?
      users = users.where(
        "CAST(id AS TEXT) LIKE :query OR document_number LIKE :query OR first_name LIKE :query OR last_name LIKE :query OR email LIKE :query OR phone LIKE :query",
        query: "%#{query}%"
      )
    end

    render json: {
      clients: users.map { |user|
        {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          phone: user.phone,
          document_number: user.document_number,
          address: user.address,
          active: user.active?,
          blocked: user.blocked?,
          accounts: user.accounts.map { |account|
            { id: account.id, account_number: account.account_number, balance: account.balance.to_f, status: account.status }
          }
        }
      }
    }, status: :ok
  end

  def register_client
    user = User.new(
      first_name: params[:first_name],
      last_name: params[:last_name],
      email: params[:email],
      phone: params[:phone],
      date_of_birth: params[:date_of_birth],
      document_number: params[:document_number],
      address: params[:address],
      role: :customer
    )
    user.pin = params[:pin]
    user.save!
    AuditLog.record!(action: "cashier_register_client", auditable: user)
    render json: { user: { id: user.id, first_name: user.first_name, last_name: user.last_name }, accounts: user.accounts.map { |account|
      { id: account.id, account_number: account.account_number, balance: account.balance.to_f }
    } }, status: :created
  rescue ActiveRecord::RecordInvalid => error
    render json: { errors: error.record.errors.full_messages }, status: :unprocessable_entity
  end

  def update_client
    user = User.find(params[:id])
    user.update!(phone: params[:phone], email: params[:email], address: params[:address])
    AuditLog.record!(action: "cashier_update_client", auditable: user)
    render json: { id: user.id, phone: user.phone, email: user.email }, status: :ok
  rescue ActiveRecord::RecordInvalid, ActiveRecord::RecordNotFound => error
    render json: { errors: error.respond_to?(:record) ? error.record.errors.full_messages : error.message }, status: :unprocessable_entity
  end

  def open_account
    user = User.find(params[:user_id])
    category = %w[savings checking business investment credit].include?(params[:account_category]) ? params[:account_category] : "savings"
    account = user.accounts.create!(default: false, account_type: :user, account_category: category)
    AuditLog.record!(action: "cashier_open_account", auditable: account)
    render json: { id: account.id, account_number: account.account_number, balance: account.balance.to_f, retained_balance: account.retained_balance.to_f, account_category: account.account_category, status: account.status }, status: :created
  rescue ActiveRecord::RecordInvalid, ActiveRecord::RecordNotFound => error
    render json: { errors: error.respond_to?(:record) ? error.record.errors.full_messages : error.message }, status: :unprocessable_entity
  end

  private

  def calculate_system_balance(session)
    opening = session.opening_balance
    movements = Transaction.includes(:account)
                            .where(created_at: session.opened_at..Time.current)
                            .where(status: :completed)
    deposits = movements.where(transaction_type: %i[deposit atm_deposit]).sum(:amount)
    withdrawals = movements.where(transaction_type: %i[withdraw atm_withdrawal transfer service_payment loan_payment]).sum(:amount)
    opening + BigDecimal(deposits.to_s) - BigDecimal(withdrawals.to_s)
  end

  def serialize_session(session)
    {
      id: session.id,
      opening_balance: session.opening_balance.to_f,
      closing_balance: session.closing_balance&.to_f,
      physical_balance: session.physical_balance&.to_f,
      difference: session.difference&.to_f,
      status: session.status,
      opened_at: session.opened_at,
      closed_at: session.closed_at
    }
  end
end
