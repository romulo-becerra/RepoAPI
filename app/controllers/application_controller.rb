class ApplicationController < ActionController::API
  before_action :authenticate_request

  attr_reader :current_user

  private

  def require_manager!
    return if current_user&.manager?

    render json: { errors: 'Acceso restringido a rol gerente' }, status: :forbidden
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
