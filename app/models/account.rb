# == Schema Information
#
# Table name: accounts
#
#  id             :integer          not null, primary key
#  user_id        :integer
#  account_number :string
#  balance        :integer          default(0)
#  clabe          :string
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#  default        :boolean          default(FALSE)
#  account_type   :integer          default("user"), not null
#
class Account < ApplicationRecord
  include AuditTrail
  belongs_to :user, optional: true
  has_many :transactions, dependent: :restrict_with_error
  has_many :recipients, dependent: :destroy
  has_many :loans, dependent: :destroy

  after_create :set_default, if: :default?

  before_validation :generate_clabe, on: :create, if: -> { clabe.blank? }
  before_validation :generate_account_number, on: :create, if: -> { account_number.blank? }

  validates :clabe, presence: true, uniqueness: true
  validates :account_number, presence: true, uniqueness: true

  ACCOUNT_TYPES = { user: 0, service: 1 }.freeze
  STATUSES = { active: 0, frozen: 1, closed: 2 }.freeze

  def account_type
    value = read_attribute(:account_type)
    ACCOUNT_TYPES.key(value)&.to_s || super
  end

  def account_type=(value)
    write_attribute(:account_type, ACCOUNT_TYPES.fetch(value.to_sym, value))
  rescue NoMethodError
    write_attribute(:account_type, value)
  end

  def account_type_user?
    read_attribute(:account_type) == ACCOUNT_TYPES[:user]
  end

  def account_type_service?
    read_attribute(:account_type) == ACCOUNT_TYPES[:service]
  end

  def active?
    read_attribute(:status) == STATUSES[:active]
  end

  def frozen?
    read_attribute(:status) == STATUSES[:frozen]
  end

  def closed?
    read_attribute(:status) == STATUSES[:closed]
  end

  def status
    value = read_attribute(:status)
    STATUSES.key(value)&.to_s || super
  end

  def status=(value)
    write_attribute(:status, STATUSES.fetch(value.to_sym, value))
  rescue NoMethodError
    write_attribute(:status, value)
  end

  def transfer!(recipient_account, amount, description = nil, performed_by_role: nil, performed_by_user_id: nil, performed_by_name: nil)
    TransactionService.new.transfer!(
      self,
      recipient_account,
      amount,
      description,
      performed_by_role: performed_by_role,
      performed_by_user_id: performed_by_user_id,
      performed_by_name: performed_by_name
    )
  end

  def default?
    default
  end

  def withdraw!(amount)
    raise StandardError, "La cuenta no está activa" unless active?

    value = BigDecimal(amount.to_s).round(2)
    raise StandardError, "El monto debe ser mayor a cero" if value <= 0
    raise StandardError, "Fondos insuficientes en la cuenta" if balance < value

    self.balance = BigDecimal(balance.to_s).round(2) - value
    save!
  end

  def deposit!(amount)
    raise StandardError, "La cuenta no está activa" unless active?

    value = BigDecimal(amount.to_s).round(2)
    raise StandardError, "El monto debe ser mayor a cero" if value <= 0

    self.balance = BigDecimal(balance.to_s).round(2) + value
    save!
  end

  def service_payment!(amount)
    value = BigDecimal(amount.to_s).round(2)
    raise StandardError, "El monto debe ser mayor a cero" if value <= 0

    self.balance = BigDecimal(balance.to_s).round(2) + value
    save!
  end

  def to_s
    "#{account_number} - #{user}"
  end

  private

  def set_default
    return false unless default?
    user.accounts.where.not(id: id).update_all(default: false)
  end

  def generate_clabe
    self.clabe = loop do
      random_clabe = rand(10**17..10**18 - 1).to_s
      break random_clabe unless Account.exists?(clabe: random_clabe)
    end
  end

  def generate_account_number
    self.account_number = rand(10**9..10**10 - 1).to_s
  end
end
