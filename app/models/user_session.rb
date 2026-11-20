class UserSession < ApplicationRecord
  belongs_to :user

  enum :status, { active: 0, expired: 1, revoked: 2 }

  validates :session_token, presence: true, uniqueness: true
  validates :expires_at, presence: true

  scope :active, -> { where(status: :active).where("expires_at > ?", Time.current) }

  before_create :set_default_status

  def expired?
    expires_at < Time.current
  end

  def active?
    status == "active" && !expired?
  end

  def refresh!
    update!(expires_at: 24.hours.from_now, last_activity_at: Time.current)
  end

  def revoke!
    update!(status: :revoked)
  end

  private

  def set_default_status
    self.status ||= :active
  end
end