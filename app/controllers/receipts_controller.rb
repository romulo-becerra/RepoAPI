class ReceiptsController < ApplicationController
  def show
    receipt = Receipt.find(params[:id])
    owned_account = current_user.accounts.exists?(id: receipt.account_id)
    return render json: { errors: "No autorizado" }, status: :forbidden unless owned_account || current_user.management?

    render json: serialize_receipt(receipt), status: :ok
  rescue ActiveRecord::RecordNotFound
    render json: { errors: "Comprobante no encontrado" }, status: :not_found
  end

  def transaction
    transaction = current_user.accounts.flat_map(&:transactions).find { |item| item.id == params[:transaction_id].to_i }
    transaction ||= Transaction.find_by(id: params[:transaction_id]) if current_user.management?
    return render json: { errors: "Movimiento no encontrado" }, status: :not_found unless transaction

    receipt = Receipt.find_by(transaction_id: transaction.id)
    unless receipt
      receipt = create_receipt(transaction)
    end
    render json: serialize_receipt(receipt), status: :ok
  rescue ActiveRecord::RecordNotFound
    render json: { errors: "Movimiento no encontrado" }, status: :not_found
  end

  def download
    receipt = Receipt.find(params[:id])
    owned_account = current_user.accounts.exists?(id: receipt.account_id)
    return render json: { errors: "No autorizado" }, status: :forbidden unless owned_account || current_user.management?

    text = [
      "ANGEL FIRE - COMPROBANTE DIGITAL",
      "Numero: #{receipt.receipt_number}",
      "Operacion: #{receipt.operation}",
      "Monto: #{format('%.2f', receipt.amount)}",
      "Cuenta: #{receipt.account.account_number}",
      "Fecha: #{receipt.created_at.iso8601}",
      "Descripcion: #{receipt.description}",
      "Estado: Emitido"
    ].join("\n")

    send_data text,
              filename: "#{receipt.receipt_number}.txt",
              type: "text/plain",
              disposition: "attachment"
  rescue ActiveRecord::RecordNotFound
    render json: { errors: "Comprobante no encontrado" }, status: :not_found
  end

  private

  def create_receipt(transaction)
    Receipt.create!(
      account: transaction.account,
      financial_transaction: transaction,
      created_by: current_user,
      receipt_number: "RC-#{Time.current.strftime('%Y%m%d')}-#{SecureRandom.hex(5).upcase}",
      operation: transaction.transaction_type,
      amount: transaction.amount,
      description: transaction.description
    )
  end

  def serialize_receipt(receipt)
    {
      id: receipt.id,
      receipt_number: receipt.receipt_number,
      transaction_id: receipt.transaction_id,
      operation: receipt.operation,
      amount: receipt.amount.to_f,
      account_number: receipt.account.account_number,
      description: receipt.description,
      created_at: receipt.created_at,
      status: "issued"
    }
  end
end
