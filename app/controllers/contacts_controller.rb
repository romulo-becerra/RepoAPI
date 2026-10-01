class ContactsController < ApplicationController
  before_action :require_manager!

  def index
    render json: { contacts: current_user.contacts.order(:name) }, status: :ok
  end

  def create
    contact = current_user.contacts.build(contact_params)
    if contact.save
      render json: { contact: contact }, status: :created
    else
      render json: { errors: contact.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    contact = current_user.contacts.find_by(id: params[:id])
    return render json: { errors: "Contacto no encontrado" }, status: :not_found unless contact

    contact.destroy!
    render json: { message: "Contacto eliminado correctamente" }, status: :ok
  end

  private

  def contact_params
    params.require(:contact).permit(:name, :phone).tap do |attributes|
      attributes[:name] = attributes[:name].to_s.strip
      attributes[:phone] = attributes[:phone].to_s.gsub(/[\s()-]/, "")
    end
  end
end
