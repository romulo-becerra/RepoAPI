class FixSeedAdminAccountAssignment < ActiveRecord::Migration[8.0]
  def up
    admin_email = ENV.fetch('ANGELFIRE_ADMIN_EMAIL', 'admin@angelfire.local')
    desired_account_number = ENV.fetch('ANGELFIRE_ADMIN_ACCOUNT_NUMBER', '9000000001')

    admin_user = User.find_by(email: admin_email)
    return unless admin_user

    admin_user.update!(role: :admin)

    matching_accounts = Account.where(account_number: desired_account_number)
    matching_accounts.update_all(user_id: admin_user.id) if matching_accounts.exists?

    admin_account = matching_accounts.order(:id).first || admin_user.accounts.find_by(default: true) || admin_user.accounts.first
    admin_account ||= admin_user.accounts.create!(default: true, balance: 100_000)
    admin_account.update!(user: admin_user, default: true)
    if admin_account.account_number.blank? && matching_accounts.empty?
      admin_account.update!(account_number: desired_account_number)
    end
  end

  def down
    admin_email = ENV.fetch('ANGELFIRE_ADMIN_EMAIL', 'admin@angelfire.local')
    admin_user = User.find_by(email: admin_email)
    return unless admin_user

    admin_user.update!(role: :manager) if admin_user.role.to_s == 'admin'
  end
end
