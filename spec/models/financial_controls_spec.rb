require "rails_helper"

RSpec.describe "Financial controls", type: :model do
  it "creates and validates password reset tokens" do
    user = create(:user, email: "reset@example.com", pin: "1234")
    token = user.generate_password_reset_token

    expect(user.password_reset_token_valid?(token)).to be(true)
    expect(user.password_reset_token_valid?("wrong")).to be(false)

    user.pin = "5678"
    expect(user.save).to be(true)
  end

  it "rejects withdrawals above the daily limit" do
    user = create(:user, pin: "1234")
    account = create(:account, user: user, balance: 1_000)
    account.update!(daily_withdraw_limit: 100)

    expect do
      TransactionService.new.withdraw!(account, 150)
    end.to raise_error(StandardError, "Límite diario de retiros excedido")
  end

  it "creates reconciliation records for discrepancy detection" do
    user = create(:user, role: :manager, pin: "1234")
    account = create(:account, user: user, balance: 500)

    reconciliation = AccountReconciliation.create!(
      account: account,
      created_by: user,
      reported_balance: 450,
      calculated_balance: 500,
      difference: -50,
      status: :discrepancy,
      reconciled_at: Time.current
    )

    expect(reconciliation.status).to eq("discrepancy")
    expect(reconciliation.difference.to_f).to eq(-50)
  end

  it "records model updates in audit logs" do
    user = create(:user, pin: "1234")
    user.update!(blocked: true)

    audit = AuditLog.where(auditable_type: "User", auditable_id: user.id, action: "update").last
    expect(audit).to be_present
  end
end
