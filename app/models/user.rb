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
require "digest"
require "securerandom"

class User < ApplicationRecord
  has_many :accounts, dependent: :destroy
  has_many :recipients, dependent: :destroy
  has_many :contacts, dependent: :destroy
  has_many :user_files, dependent: :destroy
  has_many :user_sessions, dependent: :destroy
  has_one :user_address, dependent: :destroy
  has_one :user_preference, dependent: :destroy
  has_many :support_tickets, dependent: :destroy
  has_many :notifications, dependent: :destroy
  has_many :credit_requests, dependent: :destroy
  has_one :account, -> { where(default: true) }, class_name: "Account"
  has_secure_password :pin, validations: false
  has_secure_password :basic_auth_password, validations: false

  attr_accessor :default_account_number

  attribute :role, :integer, default: 0
  enum :role, {
    customer: 0,
    manager: 1,
    cashier: 2,
    admin: 3,
    super_admin: 4,
    supervisor: 5,
    accountant: 6,
    auditor: 7,
    financial_manager: 8,
    customer_service: 9
  }, default: :customer

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

  def self.valid_basic_auth_password?(password)
    password.is_a?(String) &&
      password.length >= BASIC_AUTH_PASSWORD_MIN_LENGTH &&
      password.bytesize <= BASIC_AUTH_PASSWORD_MAX_BYTES
  end

  def staff?
    admin? || super_admin? || manager? || cashier? || customer_service?
  end

  def management?
    admin? || super_admin? || manager?
  end

  # Roles que pueden acceder al sistema de gestión (panel admin/gerente)
  def management_roles?
    admin? || super_admin? || manager? || financial_manager? || accountant? || auditor? || supervisor?
  end

  # Roles operativos (caja, atención al cliente)
  def operational_roles?
    cashier? || customer_service?
  end

  def update_last_login!(ip = nil)
    update_columns(
      last_login_at: Time.current,
      last_login_ip: ip
    )
  end

  def generate_remember_token
    token = SecureRandom.urlsafe_base64(32)
    update_columns(remember_token: Digest::SHA256.hexdigest(token))
    token
  end

  def remember_token_valid?(token)
    return false if remember_token.blank?
    ActiveSupport::SecurityUtils.secure_compare(remember_token, Digest::SHA256.hexdigest(token.to_s))
  end

  # Busca usuario por email, account_number o número de documento
  def self.find_by_login_identifier(identifier)
    identifier = identifier.to_s.strip
    return nil if identifier.blank?

    find_by(email: identifier) ||
      find_by(document_number: identifier) ||
      find_by(id: identifier) ||
      Account.includes(:user).find_by(account_number: identifier)&.user
  end

  def status_label
    return "deactivated" unless active?
    return "blocked" if blocked?

    "active"
  end

  def generate_password_reset_token
    token = SecureRandom.urlsafe_base64(32)
    update_columns(
      password_reset_digest: Digest::SHA256.hexdigest(token),
      password_reset_sent_at: Time.current
    )
    token
  end

  def password_reset_token_valid?(token)
    return false if password_reset_sent_at.blank?
    return false if password_reset_sent_at < 30.minutes.ago

    ActiveSupport::SecurityUtils.secure_compare(
      password_reset_digest.to_s,
      Digest::SHA256.hexdigest(token.to_s)
    )
  end

  private

  def create_default_account
    account_attributes = { default: true, balance: 1_000 }
    if default_account_number.present?
      account_attributes[:account_number] = default_account_number.to_s.strip
    end

    accounts.create(account_attributes)
  end
end
