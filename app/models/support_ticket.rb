class SupportTicket < ApplicationRecord
  belongs_to :user
  enum :status, { open: 0, in_progress: 1, resolved: 2, closed: 3 }, default: :open
  enum :priority, { low: 0, normal: 1, high: 2, urgent: 3 }, default: :normal
  validates :subject, :description, presence: true
end
