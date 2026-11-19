require "rails_helper"

RSpec.describe "Cashier operations", type: :model do
  it "opens and closes a cash register session" do
    user = create(:user, role: :cashier, pin: "1234")
    session = CashRegisterSession.create!(user: user, opening_balance: 10_000, opened_at: Time.current)

    expect(session.open?).to be(true)
    session.update!(closing_balance: 10_500, physical_balance: 10_500, difference: 0, status: :closed, closed_at: Time.current)
    expect(session.closed?).to be(true)
  end

  it "creates a receipt for an account operation" do
    user = create(:user, role: :cashier, pin: "1234")
    account = create(:account, user: user, balance: 1_000)
    transaction = account.transactions.create!(amount: 100, transaction_type: :deposit)
    receipt = Receipt.create!(
      account: account,
      financial_transaction: transaction,
      created_by: user,
      receipt_number: "RC-TEST-001",
      operation: "deposit",
      amount: 100,
      description: "Depósito en efectivo"
    )

    expect(receipt.receipt_number).to eq("RC-TEST-001")
  end
end
