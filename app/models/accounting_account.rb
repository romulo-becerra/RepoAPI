class AccountingAccount < ApplicationRecord
  has_many :journal_lines, dependent: :restrict_with_error

  validates :code, presence: true, uniqueness: true
  validates :name, presence: true
  validates :account_type, presence: true
end
