class JournalLine < ApplicationRecord
  belongs_to :journal_entry
  belongs_to :accounting_account

  validates :debit, :credit, numericality: { greater_than_or_equal_to: 0 }
  validate :single_side

  private

  def single_side
    errors.add(:base, "Use débito o crédito, no ambos") if debit.positive? && credit.positive?
  end
end
