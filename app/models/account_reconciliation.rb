class AccountReconciliation < ApplicationRecord
  belongs_to :account
  belongs_to :created_by, class_name: "User"

  enum :status, { pending: 0, reconciled: 1, discrepancy: 2 }, default: :pending

  validates :reported_balance, :calculated_balance, :difference, presence: true
end
