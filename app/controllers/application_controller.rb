class ApplicationController < ActionController::API
  before_action :authenticate_request
  before_action :set_audit_context
  after_action :reset_audit_context

  attr_reader :current_user

  private

  def set_audit_context
    Current.user = current_user
    Current.ip_address = request.remote_ip
  end

  def reset_audit_context
    Current.reset
  end

  def require_manager!
    return if current_user&.management?

    render json: { errors: 'Acceso restringido a Admin o Manager' }, status: :forbidden
  end

  def require_admin!
    return if current_user&.admin?

    render json: { errors: 'Acceso restringido a rol Admin' }, status: :forbidden
  end

  def require_operations_staff!
    return if current_user&.staff?

    render json: { errors: 'Acceso restringido a personal autorizado' }, status: :forbidden
  end

  def authenticate_request
    header = request.headers['Authorization']
    if header.present?
      token = header.split(' ').last
      begin
        decoded = JsonWebToken.decode(token)
        @current_user = User.find(decoded['user_id'])
        unless @current_user.can_authenticate?
          return render json: { errors: 'Usuario bloqueado o desactivado' }, status: :forbidden
        end
      rescue ActiveRecord::RecordNotFound
        render json: { errors: 'Usuario no encontrado' }, status: :unauthorized
      rescue JWT::ExpiredSignature
        render json: { errors: 'Token expirado' }, status: :unauthorized
      rescue JWT::DecodeError
        render json: { errors: 'Token inválido' }, status: :unauthorized
      end
    else
      render json: { errors: 'Token no proporcionado.' }, status: :unauthorized
    end
  end
end
