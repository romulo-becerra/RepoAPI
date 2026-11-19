class Receipt < ApplicationRecord
  belongs_to :account
  belongs_to :financial_transaction, class_name: "Transaction", foreign_key: :transaction_id, optional: true
  belongs_to :created_by, class_name: "User"

  validates :receipt_number, :operation, presence: true
  validates :amount, numericality: { greater_than_or_equal_to: 0 }
end
