module Manager
  class UsersController < ApplicationController
    before_action :require_manager!

    def index
      users = User.includes(:user_address).order(created_at: :desc)

      render json: {
        total: users.count,
        users: users.limit(300).map { |user| serialize_user(user) }
      }, status: :ok
    end

    def create
      user = User.new(manager_user_params)
      user.role = manager_user_params[:role].presence || :customer

      if user.save
        render json: {
          message: "Usuario creado por gerente",
          user: serialize_user(user.reload)
        }, status: :created
      else
        render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
      end
    end

    def destroy
      user = User.find_by(id: params[:id])
      return render json: { errors: "Usuario no encontrado" }, status: :not_found unless user

      if user.id == current_user.id
        return render json: { errors: "No puede eliminar su propio usuario" }, status: :unprocessable_entity
      end

      UserFile.where(uploaded_by_user_id: user.id).update_all(uploaded_by_user_id: nil)
      user.destroy!
      render json: { message: "Usuario eliminado correctamente", user_id: user.id }, status: :ok
    end

    private

    def manager_user_params
      params.permit(:first_name, :last_name, :email, :phone, :pin, :role)
    end

    def serialize_user(user)
      {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        address: user.user_address ? {
          country: user.user_address.country,
          city: user.user_address.city,
          province: user.user_address.province,
          street: user.user_address.street,
          postal_code: user.user_address.postal_code
        } : nil,
        created_at: user.created_at
      }
    end
  end
end
