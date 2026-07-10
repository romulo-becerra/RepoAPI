require "csv"

module Manager
  class LoansController < ApplicationController
    before_action :require_manager!
    before_action :set_account, only: %i[preview create_for_account installments download_installments]
    before_action :set_account_loan, only: %i[installments download_installments]

    def preview
      amount = BigDecimal(loan_params[:amount].to_s)
      term_months = loan_params[:term_months].to_i
      first_due_date = loan_params[:first_due_date].present? ? Date.parse(loan_params[:first_due_date].to_s) : Date.current.next_month

      raise LoanService::LoanError, "El monto del préstamo debe ser mayor que cero" if amount <= 0
      raise LoanService::LoanError, "El plazo debe ser mayor que cero" if term_months <= 0

      annual_rate = LoanService.annual_rate_for(amount)
      monthly_rate = annual_rate / 100 / 12
      monthly_payment = calculate_monthly_payment(amount, monthly_rate, term_months)
      total_payable = (monthly_payment * term_months).round(2)
      total_interest = (total_payable - amount).round(2)

      render json: {
        account_id: @account.id,
        annual_interest_rate: annual_rate.to_f,
        term_months: term_months,
        monthly_payment: monthly_payment.to_f,
        total_principal: amount.to_f,
        total_interest: total_interest.to_f,
        total_payable: total_payable.to_f,
        first_due_date: first_due_date,
        projected_schedule: build_projected_schedule(amount, monthly_rate, monthly_payment, term_months, first_due_date)
      }, status: :ok
    rescue LoanService::LoanError, Date::Error, ArgumentError => e
      render json: { errors: e.message }, status: :unprocessable_entity
    end

    def create_for_account
      service = LoanService.new(
        @account,
        amount: loan_params[:amount],
        term_months: loan_params[:term_months],
        first_due_date: loan_params[:first_due_date]
      )

      loan = service.create_loan!(
        performed_by_role: :manager,
        performed_by_user_id: current_user.id,
        performed_by_name: current_user.to_s
      )

      render json: {
        message: "Préstamo aplicado por gerente",
        account_id: @account.id,
        loan: {
          id: loan.id,
          amount: loan.amount.to_f,
          annual_interest_rate: loan.annual_interest_rate.to_f,
          term_months: loan.term_months,
          monthly_payment: loan.monthly_payment.to_f,
          first_due_date: loan.first_due_date,
          outstanding_principal: loan.outstanding_principal.to_f,
          installments: loan.loan_installments.order(:installment_number).map do |item|
            {
              installment_number: item.installment_number,
              due_date: item.due_date,
              amount: item.amount.to_f,
              principal_amount: item.principal_amount.to_f,
              interest_amount: item.interest_amount.to_f,
              status: item.status
            }
          end
        }
      }, status: :created
    rescue LoanService::LoanError => e
      render json: { errors: e.message }, status: :unprocessable_entity
    rescue ActiveRecord::RecordInvalid => e
      render json: { errors: e.record.errors.full_messages }, status: :unprocessable_entity
    end

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

    def installments
      per_page = [params[:per_page].to_i, 1].max
      per_page = 50 if per_page > 50
      per_page = 10 if per_page.zero?

      installments_scope = @loan.loan_installments.order(:installment_number)
      total = installments_scope.count
      total_pages = (total.to_f / per_page).ceil
      total_pages = 1 if total_pages.zero?

      page = [params[:page].to_i, 1].max
      page = total_pages if page > total_pages

      installments = installments_scope.offset((page - 1) * per_page).limit(per_page)

      render json: {
        account_id: @account.id,
        loan_id: @loan.id,
        page: page,
        per_page: per_page,
        total: total,
        total_pages: total_pages,
        has_prev: page > 1,
        has_next: page < total_pages,
        installments: installments.map { |item| serialize_installment(item) }
      }, status: :ok
    end

    def download_installments
      csv_data = CSV.generate(headers: true) do |csv|
        csv << ["installment_number", "due_date", "amount", "principal_amount", "interest_amount", "status", "paid_at"]
        @loan.loan_installments.order(:installment_number).each do |item|
          csv << [
            item.installment_number,
            item.due_date,
            item.amount.to_f,
            item.principal_amount.to_f,
            item.interest_amount.to_f,
            item.status,
            item.paid_at
          ]
        end
      end

      send_data csv_data,
                filename: "loan_#{@loan.id}_installments.csv",
                type: "text/csv; charset=utf-8"
    end

    private

    def set_account_loan
      @loan = @account.loans.find_by(id: params[:loan_id])
      return if @loan

      render json: { errors: "Préstamo no encontrado para la cuenta" }, status: :not_found
    end

    def set_account
      lookup = params[:account_id].to_s.strip
      @account = Account.find_by(id: lookup)
      @account ||= Account.find_by(account_number: lookup)
      return if @account

      render json: { errors: "Cuenta no encontrada" }, status: :not_found
    end

    def loan_params
      params.permit(:amount, :term_months, :first_due_date)
    end

    def calculate_monthly_payment(principal, monthly_rate, term_months)
      return (principal / term_months).round(2) if monthly_rate.zero?

      numerator = principal * monthly_rate
      denominator = 1 - (1 + monthly_rate)**(-term_months)
      (numerator / denominator).round(2)
    end

    def build_projected_schedule(amount, monthly_rate, monthly_payment, term_months, first_due_date)
      remaining_principal = amount

      term_months.times.map do |index|
        due_date = first_due_date >> index
        interest = (remaining_principal * monthly_rate).round(2)
        principal = (monthly_payment - interest).round(2)
        payment_amount = monthly_payment

        if index == term_months - 1
          principal = remaining_principal.round(2)
          payment_amount = (principal + interest).round(2)
        end

        remaining_principal = (remaining_principal - principal).round(2)

        {
          installment_number: index + 1,
          due_date: due_date,
          amount: payment_amount.to_f,
          principal_amount: principal.to_f,
          interest_amount: interest.to_f,
          projected_remaining_principal: [ remaining_principal, BigDecimal("0") ].max.to_f
        }
      end
    end

    def serialize_installment(item)
      {
        id: item.id,
        installment_number: item.installment_number,
        due_date: item.due_date,
        amount: item.amount.to_f,
        principal_amount: item.principal_amount.to_f,
        interest_amount: item.interest_amount.to_f,
        status: item.status,
        paid_at: item.paid_at
      }
    end
  end
end
