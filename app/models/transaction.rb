# == Schema Information
#
# Table name: transactions
#
#  id               :integer          not null, primary key
#  account_id       :integer          not null
#  transaction_type :integer          default("deposit")
#  amount           :decimal(, )      default(0.0)
#  description      :text             default("")
#  status           :integer          default("pending")
#  created_at       :datetime         not null
#  updated_at       :datetime         not null
#
class Transaction < ApplicationRecord
  belongs_to :account

  enum :status, [ :pending, :completed, :failed ]
  enum :transaction_type, [ :deposit, :withdraw, :transfer, :service_payment, :loan_payment, :atm_deposit, :atm_withdrawal ]

  after_create :finalize_transaction, if: :pending?

  private

  def finalize_transaction
    if deposit?
      account.deposit!(amount)
    elsif withdraw?
      account.withdraw!(amount)
    elsif loan_payment?
      account.withdraw!(amount)
    elsif atm_deposit?
      account.deposit!(amount)
    elsif atm_withdrawal?
      account.withdraw!(amount)
    elsif service_payment?
      account.service_payment!(amount)
    end

    update_column(:status, Transaction.statuses[:completed])
  rescue StandardError
    update_column(:status, Transaction.statuses[:failed]) if persisted?
    raise
  end
end
