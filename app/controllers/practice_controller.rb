class PracticeController < ApplicationController
  def params_demo
    render json: {
      message: "Solicitud autenticada correctamente",
      params: params.permit(:name, :topic).to_h
    }, status: :ok
  end
end
