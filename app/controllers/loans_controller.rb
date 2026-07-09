class LoansController < ApplicationController
  before_action :set_account
  before_action :set_loan, only: %i[show pay installments]

  def index
    loans = @account.loans.includes(:loan_installments).order(created_at: :desc)

    render json: {
      account_id: @account.id,
      loans: loans.map { |loan| serialize_loan(loan) }
    }, status: :ok
  end

  def show
    render json: {
      account_id: @account.id,
      loan: serialize_loan(@loan, include_installments: true)
    }, status: :ok
  end

  def create
    service = LoanService.new(
      @account,
      amount: loan_create_params[:amount],
      term_months: loan_create_params[:term_months],
      first_due_date: loan_create_params[:first_due_date]
    )

    loan = service.create_loan!

    render json: {
      message: "Préstamo registrado correctamente",
      account_id: @account.id,
      loan: serialize_loan(loan, include_installments: true)
    }, status: :created
  rescue LoanService::LoanError => e
    render json: { errors: e.message }, status: :unprocessable_entity
  rescue ActiveRecord::RecordInvalid => e
    render json: { errors: e.record.errors.full_messages }, status: :unprocessable_entity
  end

  def pay
    payment_result = LoanService.apply_payment!(
      @loan,
      amount: loan_payment_params[:amount],
      paid_on: loan_payment_params[:paid_on]
    )

    render json: {
      message: "Pago aplicado correctamente",
      account_id: @account.id,
      account_balance: @account.reload.balance,
      loan_id: @loan.id,
      payment: payment_result,
      loan: serialize_loan(@loan.reload, include_installments: false)
    }, status: :ok
  rescue LoanService::LoanError => e
    render json: { errors: e.message }, status: :unprocessable_entity
  end

  def installments
    paid = @loan.loan_installments.paid.order(:installment_number)
    pending = @loan.loan_installments.where(status: %i[pending partial]).order(:installment_number)

    render json: {
      loan_id: @loan.id,
      paid_installments: paid.map { |item| serialize_installment(item) },
      pending_installments: pending.map { |item| serialize_installment(item) }
    }, status: :ok
  end

  private

  def set_account
    @account = current_user.accounts.find_by(id: params[:account_id])
    return if @account

    render json: { errors: "Cuenta no encontrada" }, status: :not_found
  end

  def set_loan
    @loan = @account.loans.find_by(id: params[:id])
    return if @loan

    render json: { errors: "Préstamo no encontrado" }, status: :not_found
  end

  def loan_create_params
    params.permit(:amount, :term_months, :first_due_date)
  end

  def loan_payment_params
    params.permit(:amount, :paid_on)
  end

  def serialize_loan(loan, include_installments: false)
    result = {
      id: loan.id,
      amount: loan.amount.to_f,
      annual_interest_rate: loan.annual_interest_rate.to_f,
      term_months: loan.term_months,
      monthly_payment: loan.monthly_payment.to_f,
      status: loan.status,
      disbursed_at: loan.disbursed_at,
      first_due_date: loan.first_due_date,
      outstanding_principal: loan.outstanding_principal.to_f,
      paid_installments_count: loan.paid_installments_count,
      pending_installments_count: loan.pending_installments_count
    }

    if include_installments
      result[:installments] = loan.loan_installments.map { |item| serialize_installment(item) }
    end

    result
  end

  def serialize_installment(installment)
    {
      id: installment.id,
      installment_number: installment.installment_number,
      due_date: installment.due_date,
      amount: installment.amount.to_f,
      principal_amount: installment.principal_amount.to_f,
      interest_amount: installment.interest_amount.to_f,
      remaining_principal: installment.remaining_principal.to_f,
      remaining_interest: installment.remaining_interest.to_f,
      principal_paid: installment.principal_paid.to_f,
      interest_paid: installment.interest_paid.to_f,
      paid_amount: installment.paid_amount.to_f,
      paid_at: installment.paid_at,
      status: installment.status
    }
  end
end
