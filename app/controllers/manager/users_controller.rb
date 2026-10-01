module Manager
  class UsersController < ApplicationController
    before_action :require_manager!
    before_action :require_admin!, only: %i[create update destroy block unblock deactivate]

    def index
      per_page = [params[:per_page].to_i, 1].max
      per_page = 50 if per_page > 50
      per_page = 10 if per_page.zero?

      users_scope = User.includes(:user_address, :accounts).order(created_at: :desc)
      total = users_scope.count
      total_pages = (total.to_f / per_page).ceil
      total_pages = 1 if total_pages.zero?

      page = [params[:page].to_i, 1].max
      page = total_pages if page > total_pages

      users = users_scope.offset((page - 1) * per_page).limit(per_page)

      render json: {
        total: total,
        page: page,
        per_page: per_page,
        total_pages: total_pages,
        has_prev: page > 1,
        has_next: page < total_pages,
        users: users.map { |user| serialize_user(user) }
      }, status: :ok
    end

    def show
      user = User.includes(:user_address, :accounts).find_by(id: params[:id])
      return render json: { errors: "Usuario no encontrado" }, status: :not_found unless user

      render json: { user: serialize_user_detail(user) }, status: :ok
    end

    def create
      attributes = manager_user_params
      role = attributes[:role].presence || "customer"
      return render json: { errors: "Rol no valido" }, status: :unprocessable_entity unless User.roles.key?(role)

      if attributes[:account_number].present? && Account.exists?(account_number: attributes[:account_number].to_s.strip)
        return render json: { errors: "Numero de cuenta ya existe" }, status: :unprocessable_entity
      end

      user = User.new(attributes.except(:role, :account_number))
      user.default_account_number = attributes[:account_number].to_s.strip if attributes[:account_number].present?
      user.role = role

      if user.save
        render json: {
          message: "Usuario creado por gerente",
          user: serialize_user(user.reload)
        }, status: :created
      else
        render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
      end
    end

    def update
      user = User.find_by(id: params[:id])
      return render json: { errors: "Usuario no encontrado" }, status: :not_found unless user

      permitted = params.permit(:first_name, :last_name, :email, :phone, :pin)
      if permitted[:email].present?
        existing = User.where.not(id: user.id).find_by(email: permitted[:email].strip)
        return render json: { errors: "Correo electronico ya existe" }, status: :unprocessable_entity if existing
      end

      user.assign_attributes(permitted.to_h)
      if user.valid?
        user.save!
        render json: {
          message: "Usuario actualizado correctamente",
          user: serialize_user(user.reload)
        }, status: :ok
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

    def block
      user = User.find_by(id: params[:id])
      return render json: { errors: "Usuario no encontrado" }, status: :not_found unless user

      if user.id == current_user.id
        return render json: { errors: "No puede bloquear su propio usuario" }, status: :unprocessable_entity
      end

      return render json: { errors: "No se puede bloquear un usuario desactivado" }, status: :unprocessable_entity unless user.active?
      return render json: { message: "El usuario ya está bloqueado", user: serialize_user(user) }, status: :ok if user.blocked?

      user.update!(blocked: true)
      render json: { message: "Usuario bloqueado correctamente", user: serialize_user(user.reload) }, status: :ok
    end

    def unblock
      user = User.find_by(id: params[:id])
      return render json: { errors: "Usuario no encontrado" }, status: :not_found unless user

      return render json: { errors: "No se puede desbloquear un usuario desactivado" }, status: :unprocessable_entity unless user.active?
      return render json: { message: "El usuario ya está desbloqueado", user: serialize_user(user) }, status: :ok unless user.blocked?

      user.update!(blocked: false)
      render json: { message: "Usuario desbloqueado correctamente", user: serialize_user(user.reload) }, status: :ok
    end

    def deactivate
      user = User.find_by(id: params[:id])
      return render json: { errors: "Usuario no encontrado" }, status: :not_found unless user

      if user.id == current_user.id
        return render json: { errors: "No puede desactivar su propio usuario" }, status: :unprocessable_entity
      end

      return render json: { message: "El usuario ya está desactivado", user: serialize_user(user) }, status: :ok unless user.active?

      user.update!(active: false, blocked: false)
      render json: { message: "Usuario desactivado correctamente", user: serialize_user(user.reload) }, status: :ok
    end

    private

    def manager_user_params
      params.permit(:first_name, :last_name, :email, :phone, :pin, :role, :account_number)
    end

    def serialize_user(user)
      primary_account = user.accounts.order(default: :desc, created_at: :asc).first

      {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        active: user.active,
        blocked: user.blocked,
        status: user.status_label,
        account_number: primary_account&.account_number,
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

    def serialize_user_detail(user)
      accounts = user.accounts.order(default: :desc, created_at: :asc)
      primary_account = accounts.first

      {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        active: user.active,
        blocked: user.blocked,
        deleted: false,
        status: user.status_label,
        account_number: primary_account&.account_number,
        accounts: accounts.map { |account| serialize_account(account) },
        address: user.user_address ? {
          country: user.user_address.country,
          city: user.user_address.city,
          province: user.user_address.province,
          street: user.user_address.street,
          street_number: user.user_address.street_number,
          district: user.user_address.district,
          postal_code: user.user_address.postal_code,
          reference: user.user_address.reference
        } : nil,
        created_at: user.created_at,
        updated_at: user.updated_at
      }
    end

    def serialize_account(account)
      {
        id: account.id,
        account_number: account.account_number,
        clabe: account.clabe,
        account_type: account.account_type,
        balance: account.balance,
        default: account.default
      }
    end
  end
end
