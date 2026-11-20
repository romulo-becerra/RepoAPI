class CustomerServiceController < ApplicationController
  before_action :require_customer_service!

  def search
    query = params[:q].to_s.strip
    users = User.includes(:accounts).order(:last_name, :first_name).limit(20)
    unless query.blank?
      users = users.where(
        "CAST(users.id AS TEXT) LIKE :query OR document_number LIKE :query OR first_name LIKE :query OR last_name LIKE :query OR email LIKE :query OR phone LIKE :query OR EXISTS (SELECT 1 FROM accounts WHERE accounts.user_id = users.id AND accounts.account_number LIKE :query)",
        query: "%#{query}%"
      )
    end

    render json: { users: users.map { |user| serialize_user(user) } }, status: :ok
  end

  def register
    user = User.new(
      first_name: params[:first_name],
      last_name: params[:last_name],
      email: params[:email],
      phone: params[:phone],
      date_of_birth: params[:date_of_birth],
      document_number: params[:document_number],
      role: :customer
    )
    user.pin = params[:pin]
    user.save!
    AuditLog.record!(action: "customer_service_register", auditable: user)
    render json: { user: serialize_user(user.reload) }, status: :created
  rescue ActiveRecord::RecordInvalid => error
    render json: { errors: error.record.errors.full_messages }, status: :unprocessable_entity
  end

  def update
    user = User.find(params[:id])
    user.update!(
      first_name: params[:first_name].presence || user.first_name,
      last_name: params[:last_name].presence || user.last_name,
      email: params[:email].presence || user.email,
      phone: params[:phone].presence || user.phone,
      date_of_birth: params[:date_of_birth].presence || user.date_of_birth,
      document_number: params[:document_number].presence || user.document_number
    )
    if params[:address].present?
      address = user.user_address || user.build_user_address
      address.update!(
        country: address.country.presence || "No definido",
        city: address.city.presence || "No definido",
        province: address.province.presence || "No definido",
        street: params[:address]
      )
    end
    AuditLog.record!(action: "customer_service_update", auditable: user)
    render json: { user: serialize_user(user.reload) }, status: :ok
  rescue ActiveRecord::RecordInvalid, ActiveRecord::RecordNotFound => error
    render json: { errors: error.respond_to?(:record) ? error.record.errors.full_messages : error.message }, status: :unprocessable_entity
  end

  def unblock
    user = User.find(params[:id])
    user.update!(blocked: false)
    AuditLog.record!(action: "customer_service_unblock", auditable: user)
    render json: { user: serialize_user(user.reload) }, status: :ok
  rescue ActiveRecord::RecordNotFound
    render json: { errors: "Usuario no encontrado" }, status: :not_found
  end

  def deactivate
    user = User.find(params[:id])
    user.update!(active: false, blocked: false)
    AuditLog.record!(action: "customer_service_deactivate", auditable: user)
    render json: { user: serialize_user(user.reload) }, status: :ok
  rescue ActiveRecord::RecordNotFound
    render json: { errors: "Usuario no encontrado" }, status: :not_found
  end

  def reactivate
    user = User.find(params[:id])
    user.update!(active: true)
    AuditLog.record!(action: "customer_service_reactivate", auditable: user)
    render json: { user: serialize_user(user.reload) }, status: :ok
  rescue ActiveRecord::RecordNotFound
    render json: { errors: "Usuario no encontrado" }, status: :not_found
  end

  def reset_password
    user = User.find(params[:id])
    user.pin = params[:pin]
    user.save!
    user.update_columns(password_reset_digest: nil, password_reset_sent_at: nil)
    AuditLog.record!(action: "customer_service_reset_pin", auditable: user)
    render json: { message: "PIN restablecido correctamente" }, status: :ok
  rescue ActiveRecord::RecordInvalid, ActiveRecord::RecordNotFound => error
    render json: { errors: error.respond_to?(:record) ? error.record.errors.full_messages : error.message }, status: :unprocessable_entity
  end

  def open_account
    user = User.find(params[:user_id])
    category = %w[savings checking].include?(params[:account_category]) ? params[:account_category] : "savings"
    account = user.accounts.create!(default: false, account_type: :user, account_category: category)
    AuditLog.record!(action: "customer_service_open_account", auditable: account)
    render json: { account: { id: account.id, account_number: account.account_number, balance: account.balance.to_f, account_category: account.account_category, status: account.status } }, status: :created
  rescue ActiveRecord::RecordInvalid, ActiveRecord::RecordNotFound => error
    render json: { errors: error.respond_to?(:record) ? error.record.errors.full_messages : error.message }, status: :unprocessable_entity
  end

  def accounts
    user = User.includes(:accounts).find(params[:user_id])
    render json: { accounts: user.accounts.map { |account|
      { id: account.id, account_number: account.account_number, balance: account.balance.to_f, retained_balance: account.retained_balance.to_f, account_category: account.account_category, status: account.status }
    } }, status: :ok
  rescue ActiveRecord::RecordNotFound
    render json: { errors: "Usuario no encontrado" }, status: :not_found
  end

  def update_account_status
    account = Account.find(params[:id])
    status = params[:status].to_s
    return render json: { errors: "Estado no válido" }, status: :unprocessable_entity unless %w[active frozen closed].include?(status)

    account.status = status
    account.save!
    AuditLog.record!(action: "customer_service_update_account_status", auditable: account)
    render json: { account: { id: account.id, status: account.status } }, status: :ok
  rescue ActiveRecord::RecordNotFound
    render json: { errors: "Cuenta no encontrada" }, status: :not_found
  end

  def tickets
    scope = SupportTicket.includes(:user).order(created_at: :desc)
    scope = scope.where(user_id: params[:user_id]) if params[:user_id].present?
    render json: scope.limit(100).map { |ticket|
      { id: ticket.id, user_id: ticket.user_id, subject: ticket.subject, description: ticket.description, status: ticket.status, priority: ticket.priority, created_at: ticket.created_at }
    }, status: :ok
  end

  def create_ticket
    ticket = SupportTicket.create!(user_id: params[:user_id], subject: params[:subject], description: params[:description], priority: params[:priority].presence || :normal)
    AuditLog.record!(action: "customer_service_create_ticket", auditable: ticket)
    render json: { ticket: { id: ticket.id, status: ticket.status } }, status: :created
  rescue ActiveRecord::RecordInvalid, ActiveRecord::RecordNotFound => error
    render json: { errors: error.respond_to?(:record) ? error.record.errors.full_messages : error.message }, status: :unprocessable_entity
  end

  def close_ticket
    ticket = SupportTicket.find(params[:id])
    ticket.update!(status: :closed)
    AuditLog.record!(action: "customer_service_close_ticket", auditable: ticket)
    render json: { ticket: { id: ticket.id, status: ticket.status } }, status: :ok
  rescue ActiveRecord::RecordNotFound
    render json: { errors: "Caso no encontrado" }, status: :not_found
  end

  private

  def serialize_user(user)
    {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      phone: user.phone,
      document_number: user.document_number,
      address: user.user_address&.street,
      date_of_birth: user.date_of_birth,
      role: user.role,
      active: user.active?,
      blocked: user.blocked?,
      status: user.status_label,
      accounts: user.accounts.map { |account|
        { id: account.id, account_number: account.account_number, balance: account.balance.to_f, account_category: account.account_category, status: account.status }
      }
    }
  end
end
