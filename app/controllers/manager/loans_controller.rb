module Manager
  class LoansController < ApplicationController
    before_action :require_manager!

    def cancel
      loan = Loan.find_by(id: params[:id])
      return render json: { errors: "Préstamo no encontrado" }, status: :not_found unless loan

      if loan.completed?
        return render json: { errors: "No se puede cancelar un préstamo ya completado" }, status: :unprocessable_entity
      end

      loan.update!(status: :cancelled)

      render json: {
        message: "Préstamo cancelado por gerente",
        loan_id: loan.id,
        status: loan.status
      }, status: :ok
    end
  end
end
