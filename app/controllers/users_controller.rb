class UsersController < ApplicationController
  skip_before_action :authenticate_request, only: [ :index, :register, :login ]

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
    account = Account.find_by(account_number: params[:account_number])
    user = account&.user

    if user && user.authenticate_pin(params[:pin])
      unless user.can_authenticate?
        record_login_event(user, account.account_number, :blocked)
        return render json: { errors: "Usuario bloqueado o desactivado" }, status: :forbidden
      end

      @user = user
      record_login_event(user, account.account_number, :success)
      @account = account
      @token = JsonWebToken.encode(user_id: @user.id)
      render :login, status: :ok
    else
      record_login_event(user, params[:account_number], :failure)
      render json: { errors: "Número de cuenta o PIN incorrecto" }, status: :unauthorized
    end
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
    render json: { message: "Sesión cerrada correctamente" }, status: :ok
  end

  private

  def record_login_event(user, account_number, status)
    LoginEvent.create!(
      user: user,
      account_number: account_number.to_s.strip.truncate(50).presence || "-",
      user_name: user&.to_s,
      status: status
    )
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
end
