class CreditRequest < ApplicationRecord
  belongs_to :user
  belongs_to :account
  enum :status, { pending: 0, approved: 1, rejected: 2 }, default: :pending
  validates :amount, numericality: { greater_than: 0 }
  validates :term_months, numericality: { only_integer: true, greater_than: 0 }
end
