class Contact < ApplicationRecord
  belongs_to :user

  validates :name, presence: true, length: { maximum: 100 }
  validates :phone, presence: true,
                    format: { with: /\A\+?[0-9]{4,15}\z/ },
                    uniqueness: { scope: :user_id }
end
