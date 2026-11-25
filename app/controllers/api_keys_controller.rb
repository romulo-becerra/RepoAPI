class ApiKeysController < ApplicationController
  before_action :ensure_user_owns_keys

  def index
    api_keys = current_user.api_keys.order(created_at: :desc)
    render json: { api_keys: api_keys.map { |api_key| serialize_api_key(api_key) } }, status: :ok
  end

  def create
    name = params[:name].to_s.strip
    return render json: { errors: "El nombre de la API key es obligatorio" }, status: :unprocessable_entity if name.blank?
    if name.length > 100
      return render json: { errors: "El nombre de la API key no puede exceder 100 caracteres" },
                    status: :unprocessable_entity
    end

    api_key, secret = ApiKey.issue_for(user: current_user, name: name)
    render json: {
      message: "API key creada. Copia el secreto ahora; no se volverá a mostrar.",
      api_key: serialize_api_key(api_key).merge(secret: secret)
    }, status: :created
  rescue ActiveRecord::RecordInvalid => error
    render json: { errors: error.record.errors.full_messages }, status: :unprocessable_entity
  end

  def destroy
    api_key = current_user.api_keys.find_by(id: params[:id])
    return render json: { errors: "API key no encontrada" }, status: :not_found unless api_key

    api_key.update!(revoked_at: Time.current) if api_key.revoked_at.nil?
    render json: { message: "API key revocada correctamente", id: api_key.id }, status: :ok
  end

  private

  def ensure_user_owns_keys
    return if params[:user_id].to_s == current_user.id.to_s

    render json: { errors: "Acceso restringido a las API keys propias" }, status: :forbidden
  end

  def serialize_api_key(api_key)
    {
      id: api_key.id,
      name: api_key.name,
      prefix: api_key.token_prefix,
      created_at: api_key.created_at,
      last_used_at: api_key.last_used_at,
      revoked_at: api_key.revoked_at
    }
  end
end
