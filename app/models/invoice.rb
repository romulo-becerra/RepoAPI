class Invoice < ApplicationRecord
  belongs_to :account
  belongs_to :created_by, class_name: "User", optional: true

  validates :invoice_number, presence: true, uniqueness: true
  validates :amount, numericality: { greater_than: 0 }
end
