# == Schema Information
#
# Table name: loan_installments
#
#  id                  :integer          not null, primary key
#  loan_id             :integer          not null
#  installment_number  :integer          not null
#  due_date            :date             not null
#  amount              :decimal(15, 2)   not null
#  principal_amount    :decimal(15, 2)   not null
#  interest_amount     :decimal(15, 2)   not null
#  remaining_principal :decimal(15, 2)   not null
#  remaining_interest  :decimal(15, 2)   not null
#  paid_amount         :decimal(15, 2)   default(0), not null
#  paid_at             :datetime
#  status              :integer          default("pending"), not null
#  created_at          :datetime         not null
#  updated_at          :datetime         not null
#
class LoanInstallment < ApplicationRecord
  belongs_to :loan

  enum :status, { pending: 0, partial: 1, paid: 2 }, default: :pending

  validates :installment_number, numericality: { only_integer: true, greater_than: 0 }
  validates :amount, :principal_amount, :interest_amount,
            :remaining_principal, :remaining_interest,
            :paid_amount, numericality: { greater_than_or_equal_to: 0 }

  def apply_payment!(value, paid_on)
    payment = BigDecimal(value.to_s)
    return payment if payment <= 0

    interest_payment = [ payment, remaining_interest ].min
    self.remaining_interest = (remaining_interest - interest_payment).round(2)
    payment -= interest_payment

    principal_payment = [ payment, remaining_principal ].min
    self.remaining_principal = (remaining_principal - principal_payment).round(2)
    payment -= principal_payment

    self.paid_amount = (paid_amount + interest_payment + principal_payment).round(2)

    if remaining_interest.zero? && remaining_principal.zero?
      self.status = :paid
      self.paid_at = paid_on
    elsif paid_amount.positive?
      self.status = :partial
    end

    save!

    payment
  end

  def principal_paid
    (principal_amount - remaining_principal).round(2)
  end

  def interest_paid
    (interest_amount - remaining_interest).round(2)
  end
end
