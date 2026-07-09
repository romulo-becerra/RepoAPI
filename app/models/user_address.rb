class UserAddress < ApplicationRecord
  belongs_to :user

  validates :country, :city, :province, :street, presence: true
end
