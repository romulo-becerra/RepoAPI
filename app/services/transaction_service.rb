class InvalidTransactionError < StandardError; end
class AccountNotFoundError < StandardError; end
class InsufficientFundsError < StandardError; end
class InvalidAmountError < StandardError; end

class TransactionService
  ACTOR_TAG_REGEX = /\A\[actor:(?<role>[a-z_]+)#(?<id>\d+)(?:\|(?<name>[^\]]+))?\]\s*(?<detail>.*)\z/.freeze

  def transfer!(origin_account, recipient_account, amount, description = nil, performed_by_role: nil, performed_by_user_id: nil, performed_by_name: nil)
    normalized_amount = normalize_amount(amount)
    validate_transfer(origin_account, recipient_account, normalized_amount)

    ActiveRecord::Base.transaction do
      recipient_type = recipient_account.account_type.to_sym
      transaction_type_origin = recipient_type == :service ? :service_payment : :transfer
      transaction_type_dest = :deposit
      make_transaction(normalized_amount, origin_account, transaction_type_origin, description, performed_by_role: performed_by_role, performed_by_user_id: performed_by_user_id, performed_by_name: performed_by_name)
      make_transaction(normalized_amount, recipient_account, transaction_type_dest, description, performed_by_role: performed_by_role, performed_by_user_id: performed_by_user_id, performed_by_name: performed_by_name)
    end
  end

  def deposit!(account, amount, description = nil, transaction_type: :deposit, performed_by_role: nil, performed_by_user_id: nil, performed_by_name: nil)
    normalized_amount = normalize_amount(amount)
    validate_account_and_amount(account, normalized_amount)

    make_transaction(normalized_amount, account, transaction_type, description, performed_by_role: performed_by_role, performed_by_user_id: performed_by_user_id, performed_by_name: performed_by_name)
  end

  def withdraw!(account, amount, description = nil, transaction_type: :withdraw, performed_by_role: nil, performed_by_user_id: nil, performed_by_name: nil)
    normalized_amount = normalize_amount(amount)
    validate_account_and_amount(account, normalized_amount)
    raise InsufficientFundsError, "Saldo insuficiente para completar la operacion" if account.balance < normalized_amount

    make_transaction(normalized_amount, account, transaction_type, description, performed_by_role: performed_by_role, performed_by_user_id: performed_by_user_id, performed_by_name: performed_by_name)
  end

  def loan_payment!(account, amount, description = nil, performed_by_role: nil, performed_by_user_id: nil, performed_by_name: nil)
    withdraw!(account, amount, description, transaction_type: :loan_payment, performed_by_role: performed_by_role, performed_by_user_id: performed_by_user_id, performed_by_name: performed_by_name)
  end

  def self.parse_actor_from_description(description)
    text = description.to_s
    match = text.match(ACTOR_TAG_REGEX)
    return { detail: text, role: nil, user_id: nil, name: nil, label: "No disponible" } unless match

    role = match[:role]
    user_id = match[:id].to_i
    name = match[:name].to_s.strip.presence
    label =
      if name.present?
        name
      else
        case role
        when "manager", "admin"
          "Admin ##{user_id}"
        when "user"
          "Usuario ##{user_id}"
        else
          "#{role} ##{user_id}"
        end
      end

    {
      detail: match[:detail].presence || "-",
      role: role,
      user_id: user_id,
      name: name,
      label: label
    }
  end

  private

  def normalize_amount(amount)
    decimal_amount = BigDecimal(amount.to_s)
    raise InvalidAmountError, "Amount must be greater than 0" if decimal_amount <= 0

    decimal_amount.round(2)
  end

  def validate_account_and_amount(account, amount)
    raise AccountNotFoundError, "Account not found" if account.nil?
    raise InvalidAmountError, "Amount must be greater than 0" if amount <= 0
  end

  def validate_transfer(origin_account, recipient_account, amount)
    raise AccountNotFoundError, "Origin account not found" if origin_account.nil?
    raise AccountNotFoundError, "Recipient account not found" if recipient_account.nil?
    raise InvalidAmountError, "Amount must be greater than 0" if amount <= 0
    raise InsufficientFundsError, "Saldo insuficiente para completar la operacion" if origin_account.balance < amount
    raise InvalidTransactionError, "Cannot transfer to the same account" if origin_account == recipient_account
  end

  def make_transaction(amount, account, transaction_type, description = nil, performed_by_role: nil, performed_by_user_id: nil, performed_by_name: nil)
    tagged_description = build_actor_description(description, performed_by_role, performed_by_user_id, performed_by_name)

    account.transactions.create!(
      amount: amount,
      transaction_type: transaction_type,
      description: tagged_description,
      status: :pending
    )
  end

  def build_actor_description(description, role, user_id, name = nil)
    detail = description.to_s.strip
    return detail if role.blank? || user_id.blank?

    name_part = name.to_s.strip
    name_segment = name_part.present? ? "|#{name_part}" : ""
    "[actor:#{role}##{user_id}#{name_segment}] #{detail}"
  end
end
