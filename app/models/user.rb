# == Schema Information
#
# Table name: users
#
#  id                :integer          not null, primary key
#  first_name        :string
#  last_name         :string
#  pin_digest        :string
#  biometric_enabled :boolean
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#  email             :string
#
class User < ApplicationRecord
  has_many :accounts, dependent: :destroy
  has_many :recipients, dependent: :destroy
  has_many :user_files, dependent: :destroy
  has_one :user_address, dependent: :destroy
  has_one :account, -> { where(default: true) }, class_name: "Account"
  has_secure_password :pin, validations: false

  attribute :role, :integer, default: 0
  enum :role, { customer: 0, manager: 1 }, default: :customer

  validates :first_name, presence: true
  validates :last_name, presence: true
  validates :email, presence: true, uniqueness: true
  validates :phone, uniqueness: true, allow_blank: true
  validates :pin, length: { is: 4 },  numericality: { only_integer: true }, on: :create

  after_create :create_default_account

  validates :email, allow_blank: true, format: { with: /\A[^@\s]+@[^@\s]+\z/ }
  validates :phone, allow_blank: true, format: { with: /\A\+?[0-9]{8,15}\z/ }
  validates :active, inclusion: { in: [ true, false ] }
  validates :blocked, inclusion: { in: [ true, false ] }

  def to_s
    "#{first_name} #{last_name}"
  end

  def can_authenticate?
    active? && !blocked?
  end

  def status_label
    return "deactivated" unless active?
    return "blocked" if blocked?

    "active"
  end

  private

  def create_default_account
    accounts.create(default: true, balance: 1_000)
  end
end
