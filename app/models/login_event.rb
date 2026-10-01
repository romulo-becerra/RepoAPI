class LoginEvent < ApplicationRecord
  belongs_to :user, optional: true

  enum :status, { success: 0, failure: 1, blocked: 2 }

  validates :account_number, presence: true
  validates :user_name, presence: true, if: :user_id?
end
