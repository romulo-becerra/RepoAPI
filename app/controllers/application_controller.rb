require "base64"

class ApplicationController < ActionController::API
  before_action :authenticate_request

  attr_reader :current_user

  private

  def require_manager!
    return if current_user&.management?

    render json: { errors: "Acceso restringido a Admin o Manager" }, status: :forbidden
  end

  def require_admin!
    return if current_user&.admin?

    render json: { errors: "Acceso restringido a rol Admin" }, status: :forbidden
  end

  def require_operations_staff!
    return if current_user&.staff?

    render json: { errors: "Acceso restringido a personal autorizado" }, status: :forbidden
  end

  def authenticate_request
    api_key = request.headers["X-API-Key"]
    return authenticate_api_key(api_key) if api_key.present?

    header = request.headers["Authorization"]
    return authenticate_basic_request(header) if header&.match?(/\ABasic(?:\s|\z)/i)
    return authenticate_jwt_request(header) if header.present?

    render json: { errors: "Token no proporcionado." }, status: :unauthorized
  end

  def authenticate_api_key(secret)
    api_key = ApiKey.authenticate(secret)
    unless api_key
      return render json: { errors: "API key inválida o revocada" }, status: :unauthorized
    end

    @current_user = api_key.user
    return if @current_user.can_authenticate?

    render json: { errors: "Usuario bloqueado o desactivado" }, status: :forbidden
  end

  def authenticate_basic_request(header)
    encoded_credentials = header.split(/\s+/, 2).last
    decoded_credentials = Base64.strict_decode64(encoded_credentials.to_s)
    username, password = decoded_credentials.split(":", 2)
    user = User.find_by(email: username)

    unless password.present? && user&.authenticate_basic_auth_password(password)
      return render json: { errors: "Credenciales Basic inválidas" }, status: :unauthorized
    end

    return render json: { errors: "Usuario bloqueado o desactivado" }, status: :forbidden unless user.can_authenticate?

    @current_user = user
  rescue ArgumentError
    render json: { errors: "Credenciales Basic inválidas" }, status: :unauthorized
  end

  def authenticate_jwt_request(header)
    token = header.split(" ").last
    decoded = JsonWebToken.decode(token)
    @current_user = User.find(decoded["user_id"])
    return if @current_user.can_authenticate?

    render json: { errors: "Usuario bloqueado o desactivado" }, status: :forbidden
  rescue ActiveRecord::RecordNotFound
    render json: { errors: "Usuario no encontrado" }, status: :unauthorized
  rescue JWT::ExpiredSignature
    render json: { errors: "Token expirado" }, status: :unauthorized
  rescue JWT::DecodeError
    render json: { errors: "Token inválido" }, status: :unauthorized
  end
end
