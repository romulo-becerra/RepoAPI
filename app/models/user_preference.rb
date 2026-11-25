class UserPreference < ApplicationRecord
  belongs_to :user
  validates :language, :preferred_currency, :timezone, :theme, presence: true
end
