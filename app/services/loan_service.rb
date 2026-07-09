class LoanService
  class LoanError < StandardError; end

  def self.annual_rate_for(amount)
    total = BigDecimal(amount.to_s)

    return BigDecimal("5.0") if total <= BigDecimal("100000")
    return BigDecimal("5.5") if total <= BigDecimal("200000")

    BigDecimal("6.0")
  end

  def initialize(account, amount:, term_months:, first_due_date: nil)
    @account = account
    @amount = BigDecimal(amount.to_s)
    @term_months = term_months.to_i
    @first_due_date = first_due_date.present? ? Date.parse(first_due_date.to_s) : Date.current.next_month
  rescue Date::Error
    raise LoanError, "La fecha de primera cuota es inválida"
  end

  def self.apply_payment!(loan, amount:, paid_on: nil, performed_by_role: nil, performed_by_user_id: nil, performed_by_name: nil)
    new(loan.account, amount: 1, term_months: 1).apply_payment!(
      loan,
      amount: amount,
      paid_on: paid_on,
      performed_by_role: performed_by_role,
      performed_by_user_id: performed_by_user_id,
      performed_by_name: performed_by_name
    )
  end

  def create_loan!(performed_by_role: nil, performed_by_user_id: nil, performed_by_name: nil)
    validate_inputs!

    annual_rate = self.class.annual_rate_for(@amount)
    monthly_rate = annual_rate / 100 / 12
    monthly_payment = calculate_monthly_payment(@amount, monthly_rate, @term_months)

    ActiveRecord::Base.transaction do
      loan = @account.loans.create!(
        amount: @amount.round(2),
        annual_interest_rate: annual_rate,
        term_months: @term_months,
        monthly_payment: monthly_payment,
        outstanding_principal: @amount.round(2),
        first_due_date: @first_due_date,
        disbursed_at: Time.current,
        status: :active
      )

      build_installments!(loan, monthly_rate, monthly_payment)
      TransactionService.new.deposit!(
        @account,
        @amount,
        "Desembolso de préstamo ##{loan.id}",
        performed_by_role: performed_by_role,
        performed_by_user_id: performed_by_user_id,
        performed_by_name: performed_by_name
      )

      loan
    end
  end

  def apply_payment!(loan, amount:, paid_on: nil, performed_by_role: nil, performed_by_user_id: nil, performed_by_name: nil)
    payment_left = BigDecimal(amount.to_s)
    raise LoanError, "El monto a pagar debe ser mayor que cero" if payment_left <= 0

    paid_at = paid_on.present? ? Time.zone.parse(paid_on.to_s) : Time.current
    raise LoanError, "La fecha de pago es inválida" if paid_at.nil?

    principal_paid_total = BigDecimal("0")
    interest_paid_total = BigDecimal("0")
    payment_transaction = nil

    ActiveRecord::Base.transaction do
      loan.lock!
      total_due = loan.loan_installments
                     .where(status: %i[pending partial])
                     .sum("remaining_principal + remaining_interest")

      raise LoanError, "El préstamo no tiene saldo pendiente" if total_due <= 0
      raise LoanError, "El monto excede el saldo pendiente del préstamo" if payment_left > total_due

      payment_transaction = TransactionService.new.loan_payment!(
        loan.account,
        payment_left,
        "Pago de préstamo ##{loan.id}",
        performed_by_role: performed_by_role,
        performed_by_user_id: performed_by_user_id,
        performed_by_name: performed_by_name
      )

      loan.loan_installments.where(status: %i[pending partial]).order(:installment_number).each do |installment|
        break if payment_left <= 0

        previous_principal = installment.remaining_principal
        previous_interest = installment.remaining_interest

        payment_left = installment.apply_payment!(payment_left, paid_at)

        principal_paid_total += (previous_principal - installment.remaining_principal)
        interest_paid_total += (previous_interest - installment.remaining_interest)
      end

      if principal_paid_total.positive?
        new_outstanding = (loan.outstanding_principal - principal_paid_total).round(2)
        loan.outstanding_principal = [ new_outstanding, BigDecimal("0") ].max
      end

      loan.status = :completed if loan.outstanding_principal.zero?
      loan.save!
    end

    {
      transaction_id: payment_transaction&.id,
      principal_paid: principal_paid_total.round(2),
      interest_paid: interest_paid_total.round(2),
      remaining_payment: payment_left.round(2)
    }
  end

  private

  def validate_inputs!
    raise LoanError, "El monto del préstamo debe ser mayor que cero" if @amount <= 0
    raise LoanError, "El plazo debe ser mayor que cero" if @term_months <= 0
  end

  def calculate_monthly_payment(principal, monthly_rate, term_months)
    return (principal / term_months).round(2) if monthly_rate.zero?

    numerator = principal * monthly_rate
    denominator = 1 - (1 + monthly_rate)**(-term_months)
    (numerator / denominator).round(2)
  end

  def build_installments!(loan, monthly_rate, base_monthly_payment)
    remaining_principal = @amount

    @term_months.times do |index|
      due_date = @first_due_date >> index
      interest = (remaining_principal * monthly_rate).round(2)
      principal = (base_monthly_payment - interest).round(2)
      amount = base_monthly_payment

      if index == @term_months - 1
        principal = remaining_principal.round(2)
        amount = (principal + interest).round(2)
      end

      remaining_principal = (remaining_principal - principal).round(2)

      loan.loan_installments.create!(
        installment_number: index + 1,
        due_date: due_date,
        amount: amount,
        principal_amount: principal,
        interest_amount: interest,
        remaining_principal: principal,
        remaining_interest: interest,
        status: :pending
      )
    end
  end
end
