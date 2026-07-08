class UsersController < ApplicationController
  skip_before_action :authenticate_request, only: [:index, :register, :login]

  def index
    render json: { status: 'ok', service: 'bankfacilito', message: 'API funcionando' }, status: :ok
  end

  def register
    attrs = registration_params
    @user = User.new(attrs)

    if @user.save
      @account = @user.accounts.first
      @token = JsonWebToken.encode(user_id: @user.id)
      render :register, status: :created
    else
      render json: { errors: @user.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def login
    account = Account.find_by(account_number: params[:account_number])

    if account && account.user.authenticate_pin(params[:pin])
      @user = account.user
      @account = account
      @token = JsonWebToken.encode(user_id: @user.id)
      render :login, status: :ok
    else
      render json: { errors: 'Número de cuenta o PIN incorrecto' }, status: :unauthorized
    end
  end

  def update
    @user = User.find_by(id: params[:id])

    return render json: { errors: 'Solicitud inválida' }, status: :bad_request unless @user && @user.id == @current_user.id

    if @user.update(user_params)
      render :update, status: :ok
    else
      render json: { errors: @user.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def registration_params
    payload = request.raw_post.presence || request.body.read.to_s
    return params.permit(:first_name, :last_name, :email, :pin).to_h.symbolize_keys if payload.blank?

    data = JSON.parse(payload)
    return {} unless data.is_a?(Hash)

    data = data.with_indifferent_access
    data.slice(:first_name, :last_name, :email, :pin)
  rescue JSON::ParserError, TypeError
    params.permit(:first_name, :last_name, :email, :pin).to_h.symbolize_keys
  end

  def user_params
    params.permit(:first_name, :last_name, :email, :pin)
  end
end
