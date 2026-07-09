# == Schema Information
#
# Table name: loans
#
#  id                    :integer          not null, primary key
#  account_id            :integer          not null
#  amount                :decimal(15, 2)   not null
#  annual_interest_rate  :decimal(5, 2)    not null
#  term_months           :integer          not null
#  monthly_payment       :decimal(15, 2)   not null
#  outstanding_principal :decimal(15, 2)   not null
#  first_due_date        :date             not null
#  disbursed_at          :datetime         not null
#  status                :integer          default("active"), not null
#  created_at            :datetime         not null
#  updated_at            :datetime         not null
#
class Loan < ApplicationRecord
  belongs_to :account
  has_many :loan_installments, -> { order(:installment_number) }, dependent: :destroy

  enum :status, { active: 0, completed: 1, cancelled: 2 }, default: :active

  validates :amount, numericality: { greater_than: 0 }
  validates :term_months, numericality: { only_integer: true, greater_than: 0 }
  validates :annual_interest_rate, numericality: { greater_than_or_equal_to: 0 }
  validates :monthly_payment, numericality: { greater_than: 0 }
  validates :outstanding_principal, numericality: { greater_than_or_equal_to: 0 }

  def paid_installments_count
    loan_installments.paid.count
  end

  def pending_installments_count
    loan_installments.where.not(status: :paid).count
  end
end
