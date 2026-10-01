class UserAddressesController < ApplicationController
  before_action :set_user

  def show
    address = @user.user_address
    return render json: { errors: "Dirección no encontrada" }, status: :not_found unless address

    render json: serialize_address(address), status: :ok
  end

  def upsert
    address = @user.user_address || @user.build_user_address

    if address.update(address_params)
      render json: {
        message: "Dirección guardada correctamente",
        address: serialize_address(address)
      }, status: :ok
    else
      render json: { errors: address.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def set_user
    @user = User.find_by(id: params[:id])
    return render json: { errors: "Usuario no encontrado" }, status: :not_found unless @user
    return if current_user.management? || current_user.id == @user.id

    render json: { errors: "No autorizado para gestionar esta dirección" }, status: :forbidden
  end

  def address_params
    params.permit(:country, :city, :province, :street, :street_number, :district, :postal_code, :reference)
  end

  def serialize_address(address)
    {
      id: address.id,
      user_id: address.user_id,
      country: address.country,
      city: address.city,
      province: address.province,
      street: address.street,
      street_number: address.street_number,
      district: address.district,
      postal_code: address.postal_code,
      reference: address.reference,
      created_at: address.created_at,
      updated_at: address.updated_at
    }
  end
end
