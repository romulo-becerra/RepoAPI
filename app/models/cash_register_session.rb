class CashRegisterSession < ApplicationRecord
  belongs_to :user

  enum :status, { open: 0, closed: 1 }, default: :open

  validates :opening_balance, numericality: { greater_than_or_equal_to: 0 }
end
