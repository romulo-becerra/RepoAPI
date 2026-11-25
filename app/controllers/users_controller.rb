class UsersController < ApplicationController
  skip_before_action :authenticate_request, only: [
    :index,
    :register,
    :login,
    :login_admin,
    :login_manager,
    :login_cashier,
    :login_customer_service,
    :login_customer,
    :password_reset_request,
    :password_reset
  ]
  before_action :require_admin!, only: [ :force_password_change ]
  before_action :set_current_user_session, only: [ :logout, :sessions, :terminate_session, :terminate_all_sessions ]

  def index
    render json: { status: "ok", service: "bankfacilito", message: "API funcionando" }, status: :ok
  end

  def register
    attrs = registration_params
    @user = User.new(attrs.slice(:first_name, :last_name, :email, :phone, :date_of_birth))
    @user.pin = attrs[:pin]

    User.transaction do
      @user.save!
      address_attributes = attrs[:address].to_h
      @user.create_user_address!(address_attributes) if address_attributes.present?
    end

    @account = @user.accounts.find_by(default: true) || @user.accounts.first
    @token = JsonWebToken.encode(user_id: @user.id)
    render :register, status: :created
  rescue ActiveRecord::RecordInvalid => error
    render json: { errors: error.record.errors.full_messages }, status: :unprocessable_entity
  end

  def login
    identifier = params[:identifier].presence || params[:account_number]
    identifier = identifier.to_s.strip
    pin = params[:pin].to_s
    expected_role = params[:role].to_s.strip.downcase
    remember_me = params[:remember_me].to_s == "true"

    # Buscar usuario por email, account_number o document_number
    user = User.find_by_login_identifier(identifier)

    if user.nil?
      record_login_event(nil, identifier, :failure)
      return render json: { errors: "Credenciales inválidas" }, status: :unauthorized
    end

    # Verificar que el usuario esté activo y no bloqueado
    if user.locked_until.present? && user.locked_until > Time.current
      record_login_event(user, identifier, :blocked)
      return render json: { errors: "Usuario bloqueado temporalmente" }, status: :forbidden
    end

    if !user.can_authenticate?
      record_login_event(user, identifier, :blocked)
      return render json: { errors: "Usuario bloqueado o desactivado" }, status: :forbidden
    end

    # Verificar PIN
    unless user.authenticate_pin(pin)
      attempts = user.failed_login_attempts.to_i + 1
      locked_until = attempts >= 5 ? 15.minutes.from_now : nil
      user.update!(failed_login_attempts: attempts, locked_until: locked_until)
      record_login_event(user, identifier, :failure)
      return render json: { errors: "Número de cuenta o PIN incorrecto" }, status: :unauthorized
    end

    # Validar rol si se especificó
    role_matches = user.role == expected_role || (expected_role == "admin" && user.super_admin?)
    if expected_role.present? && !role_matches
      record_login_event(user, identifier, :failure)
      return render json: {
        errors: "Este usuario no tiene el rol #{expected_role}",
        user_role: user.role
      }, status: :forbidden
    end

    # Control de sesiones concurrentes para usuarios staff
    if user.staff? || user.management?
      active_session = user.user_sessions.active.find_by(session_token: nil)
      if active_session
        active_session.revoke!
      end
    end

    # Limpiar intentos fallidos
    user.update!(failed_login_attempts: 0, locked_until: nil)
    user.update_last_login!(request.remote_ip)

    # Generar token de recordar
    remember_token = nil
    if remember_me
      remember_token = user.generate_remember_token
    end

    # Crear session de usuario
    session = user.user_sessions.create!(
      session_token: SecureRandom.urlsafe_base64(32),
      ip_address: request.remote_ip,
      user_agent: request.user_agent.to_s.truncate(255),
      expires_at: remember_me ? 30.days.from_now : 24.hours.from_now,
      device_name: detect_device(request.user_agent.to_s)
    )

    record_login_event(user, identifier, :success)
    @user = user
    @account = user.accounts.find_by(default: true) || user.accounts.first
    @token = JsonWebToken.encode(user_id: user.id)
    @session_token = session.session_token
    @remember_token = remember_token
    @permissions = role_permissions(user.role)
    @dashboard_url = dashboard_url_for_role(user.role)

    render :login, status: :ok
  end

  def login_admin
    params[:role] = "admin"
    login
  end

  def login_manager
    params[:role] = "manager"
    login
  end

  def login_cashier
    params[:role] = "cashier"
    login
  end

  def login_customer_service
    params[:role] = "customer_service"
    login
  end

  def login_customer
    params[:role] = "customer"
    login
  end

  def update
    @user = User.find_by(id: params[:id])

    return render json: { errors: "Solicitud inválida" }, status: :bad_request unless @user && @user.id == @current_user.id

    if @user.update(user_params)
      render :update, status: :ok
    else
      render json: { errors: @user.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def pin
    @user = User.find_by(id: params[:id])
    return render json: { errors: "Usuario no encontrado" }, status: :not_found unless @user && @user.id == @current_user.id

    if @user.authenticate_pin(params[:current_pin])
      @user.pin = params[:new_pin]
      if @user.save
        render json: { message: "PIN actualizado correctamente" }, status: :ok
      else
        render json: { errors: @user.errors.full_messages }, status: :unprocessable_entity
      end
    else
      render json: { errors: "PIN actual incorrecto" }, status: :unauthorized
    end
  end

  def basic_auth_password
    return render json: { errors: "Solicitud inválida" }, status: :bad_request unless params[:id].to_s == @current_user.id.to_s

    password = params[:basic_auth_password]
    unless User.valid_basic_auth_password?(password)
      return render json: { errors: "La contraseña Basic debe tener al menos 12 caracteres y no más de 72 bytes" },
                    status: :unprocessable_entity
    end

    @current_user.basic_auth_password = password
    if @current_user.save
      render json: { message: "Contraseña Basic configurada correctamente" }, status: :ok
    else
      render json: { errors: @current_user.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def profile
    @user = User.find_by(id: params[:id])
    return render json: { errors: "Usuario no encontrado" }, status: :not_found unless @user && @user.id == @current_user.id

    render json: {
      user: {
        id: @user.id,
        first_name: @user.first_name,
        last_name: @user.last_name,
        email: @user.email,
        phone: @user.phone,
        date_of_birth: @user.date_of_birth,
        role: @user.role
      }
    }, status: :ok
  end

  def logout
    # Revocar la session actual si existe
    if @current_user && params[:session_token].present?
      session = @current_user.user_sessions.find_by(session_token: params[:session_token])
      session&.revoke!
    end
    render json: { message: "Sesión cerrada correctamente" }, status: :ok
  end

  def sessions
    @sessions = @current_user.user_sessions.active.order(created_at: :desc)
    render json: {
      sessions: @sessions.map { |s|
        {
          id: s.id,
          device_name: s.device_name,
          ip_address: s.ip_address,
          created_at: s.created_at,
          last_activity_at: s.last_activity_at,
          expires_at: s.expires_at
        }
      }
    }, status: :ok
  end

  def terminate_session
    session = @current_user.user_sessions.find_by(id: params[:id])
    return render json: { errors: "Sesión no encontrada" }, status: :not_found unless session
    session.revoke!
    render json: { message: "Sesión terminada" }, status: :ok
  end

  def terminate_all_sessions
    @current_user.user_sessions.active.update_all(status: :revoked)
    render json: { message: "Todas las sesiones terminadas" }, status: :ok
  end

  def password_reset_request
    user = User.find_by(email: params[:email].to_s.strip.downcase)
    token = user&.generate_password_reset_token

    response = { message: "Si el correo existe, recibirá instrucciones para recuperar el PIN" }
    response[:reset_token] = token if Rails.env.development? && token.present?
    render json: response, status: :ok
  end

  def force_password_change
    @user = User.find_by(id: params[:id])
    return render json: { errors: "Usuario no encontrado" }, status: :not_found unless @user
    @user.update!(force_pin_change: params[:enabled].to_s != "false")
    render json: { message: "Cambio obligatorio actualizado", force_pin_change: @user.force_pin_change }, status: :ok
  end

  def password_reset
    user = User.find_by(email: params[:email].to_s.strip.downcase)
    if user.nil? || !user.password_reset_token_valid?(params[:reset_token])
      return render json: { errors: "Token inválido o expirado" }, status: :unprocessable_entity
    end

    user.pin = params[:new_pin]
    if user.save
      user.update_columns(password_reset_digest: nil, password_reset_sent_at: nil)
      AuditLog.record!(action: "password_reset", auditable: user)
      render json: { message: "PIN restablecido correctamente" }, status: :ok
    else
      render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def record_login_event(user, account_number, status)
    LoginEvent.create!(
      user: user,
      account_number: account_number.to_s.strip.truncate(50).presence || "-",
      user_name: user&.to_s,
      status: status,
      ip_address: request.remote_ip,
      device: request.user_agent.to_s.truncate(255)
    )
  end

  def detect_device(user_agent)
    return "Unknown" if user_agent.blank?
    ua = user_agent.to_s.downcase
    if ua.include?("android")
      "Android Device"
    elsif ua.include?("iphone") || ua.include?("ipad")
      "iOS Device"
    elsif ua.include?("macintosh") || ua.include?("mac os")
      "Mac"
    elsif ua.include?("windows")
      "Windows PC"
    elsif ua.include?("linux")
      "Linux PC"
    else
      ua.truncate(50)
    end
  end

  def registration_params
    payload = request.raw_post.presence || request.body.read.to_s
    permitted = params.permit(
      :first_name, :last_name, :email, :phone, :date_of_birth, :pin,
      address: %i[country city province street street_number district postal_code reference]
    )
    return permitted.to_h.deep_symbolize_keys if payload.blank?

    data = JSON.parse(payload)
    return {} unless data.is_a?(Hash)

    data = data.with_indifferent_access
    address = data[:address].is_a?(Hash) ? data[:address].with_indifferent_access : {}
    {
      first_name: data[:first_name],
      last_name: data[:last_name],
      email: data[:email],
      phone: data[:phone],
      date_of_birth: data[:date_of_birth],
      pin: data[:pin],
      address: address.slice(:country, :city, :province, :street, :street_number, :district, :postal_code, :reference)
    }
  rescue JSON::ParserError, TypeError
    params.permit(:first_name, :last_name, :email, :pin).to_h.symbolize_keys
  end

  def user_params
    params.permit(:first_name, :last_name, :email, :phone, :date_of_birth, :pin)
  end

  def role_permissions(role)
    ROLE_PERMISSIONS_MAP[role.to_s] || []
  end

  def dashboard_url_for_role(role)
    case role.to_s
    when "customer"
      "/customer/dashboard"
    when "cashier"
      "/cashier"
    when "customer_service"
      "/customer_service"
    when "manager", "admin", "super_admin", "supervisor", "financial_manager", "accountant", "auditor"
      "/manager/reports/dashboard"
    else
      "/"
    end
  end

  def set_current_user_session
    session_token = params[:session_token].presence || request.headers["X-Session-Token"]
    @current_session = @current_user.user_sessions.find_by(session_token: session_token) if session_token.present?
  end

  ROLE_PERMISSIONS_MAP = {
    "customer" => %w[self_service accounts transactions profile preferences],
    "manager" => %w[users accounts transactions loans reports reconciliation accounting invoices audit logins operations],
    "cashier" => %w[accounts deposits withdrawals service_payments receipts clients],
    "admin" => %w[users accounts transactions loans reports reconciliation accounting invoices audit logins operations roles],
    "super_admin" => %w[all],
    "supervisor" => %w[accounts transactions loans reports users],
    "accountant" => %w[accounting reconciliations reports invoices],
    "auditor" => %w[audit reports logins operations],
    "financial_manager" => %w[accounts transactions loans reports reconciliation invoices],
    "customer_service" => %w[clients accounts tickets cards documents credit_requests digital_banking]
  }.freeze
end
