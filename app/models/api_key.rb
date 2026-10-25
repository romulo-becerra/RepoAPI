require "digest"
require "securerandom"

class ApiKey < ApplicationRecord
  belongs_to :user

  scope :active, -> { where(revoked_at: nil) }

  validates :name, presence: true, length: { maximum: 100 }
  validates :token_digest, presence: true, uniqueness: true
  validates :token_prefix, presence: true

  def self.issue_for(user:, name:)
    secret = "afk_#{SecureRandom.urlsafe_base64(32, false)}"
    key = user.api_keys.create!(
      name: name,
      token_digest: digest(secret),
      token_prefix: secret.first(12)
    )

    [ key, secret ]
  end

  def self.authenticate(secret)
    return if secret.blank?

    key = active.includes(:user).find_by(token_digest: digest(secret))
    return unless key

    key.update_column(:last_used_at, Time.current)
    key
  end

  def self.digest(secret)
    Digest::SHA256.hexdigest(secret)
  end
end
