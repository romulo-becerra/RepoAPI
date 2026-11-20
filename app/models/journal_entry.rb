class JournalEntry < ApplicationRecord
  belongs_to :created_by, class_name: "User"
  belongs_to :approved_by, class_name: "User", optional: true
  has_many :journal_lines, dependent: :destroy

  validates :reference, presence: true
  validate :balanced

  private

  def balanced
    debit = journal_lines.sum(&:debit)
    credit = journal_lines.sum(&:credit)
    errors.add(:base, "El asiento no está balanceado") unless debit == credit
  end
end
