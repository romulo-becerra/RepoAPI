class ServicesController < ApplicationController
  skip_before_action :authenticate_request, only: [:index]
  
  def index
    @services = Service.all
    render :index
  end

  def show
    @service = Service.find_by(id: params[:id])
    return render json: { errors: 'Servicio no encontrado' }, status: :not_found unless @service

    render json: { id: @service.id, name: @service.name, description: @service.description }, status: :ok
  end
end
