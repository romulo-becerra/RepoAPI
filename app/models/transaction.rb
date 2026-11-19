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
  include AuditTrail
  belongs_to :account

  enum :status, [ :pending, :completed, :failed ]
  enum :transaction_type, [ :deposit, :withdraw, :transfer, :service_payment, :loan_payment, :atm_deposit, :atm_withdrawal ]

  before_destroy :prevent_ledger_deletion
  after_create :finalize_transaction, if: :pending?

  def reversible?
    completed? && reversed_at.nil?
  end

  def reversed?
    reversed_at.present?
  end

  private

  def prevent_ledger_deletion
    throw(:abort)
  end

  def finalize_transaction
    balance_before = account.balance

    if deposit?
      account.deposit!(amount)
    elsif withdraw?
      account.withdraw!(amount)
    elsif transfer?
      account.withdraw!(amount)
    elsif loan_payment?
      account.withdraw!(amount)
    elsif atm_deposit?
      account.deposit!(amount)
    elsif atm_withdrawal?
      account.withdraw!(amount)
    elsif service_payment?
      account.account_type_service? ? account.deposit!(amount) : account.withdraw!(amount)
    end

    update_columns(
      status: Transaction.statuses[:completed],
      balance_before: balance_before,
      balance_after: account.reload.balance
    )
  rescue StandardError
    update_column(:status, Transaction.statuses[:failed]) if persisted?
    raise
  end
end
