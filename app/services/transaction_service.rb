class InvalidTransactionError < StandardError; end
class AccountNotFoundError < StandardError; end
class InsufficientFundsError < StandardError; end
class InvalidAmountError < StandardError; end

class TransactionService
  def transfer!(origin_account, recipient_account, amount, description = nil)
    normalized_amount = normalize_amount(amount)
    validate_transfer(origin_account, recipient_account, normalized_amount)

    ActiveRecord::Base.transaction do
      recipient_type = recipient_account.account_type.to_sym
      transaction_type_origin = recipient_type == :service ? :service_payment : :transfer
      transaction_type_dest = :deposit
      make_transaction(normalized_amount, origin_account, transaction_type_origin, description)
      make_transaction(normalized_amount, recipient_account, transaction_type_dest, description)
    end
  end

  def deposit!(account, amount, description = nil, transaction_type: :deposit)
    normalized_amount = normalize_amount(amount)
    validate_account_and_amount(account, normalized_amount)

    make_transaction(normalized_amount, account, transaction_type, description)
  end

  def withdraw!(account, amount, description = nil, transaction_type: :withdraw)
    normalized_amount = normalize_amount(amount)
    validate_account_and_amount(account, normalized_amount)
    raise InsufficientFundsError, "Insufficient funds in account" if account.balance < normalized_amount

    make_transaction(normalized_amount, account, transaction_type, description)
  end

  def loan_payment!(account, amount, description = nil)
    withdraw!(account, amount, description, transaction_type: :loan_payment)
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
    raise InsufficientFundsError, "Insufficient funds in origin account" if origin_account.balance < amount
    raise InvalidTransactionError, "Cannot transfer to the same account" if origin_account == recipient_account
  end

  def make_transaction(amount, account, transaction_type, description = nil)
    account.transactions.create!(
      amount: amount,
      transaction_type: transaction_type,
      description: description,
      status: :pending
    )
  end
end
