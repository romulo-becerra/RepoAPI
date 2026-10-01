class AdminSeedService
  DEFAULT_EMAIL = ENV.fetch('ANGELFIRE_ADMIN_EMAIL', 'admin@angelfire.local')
  DEFAULT_PIN = ENV.fetch('ANGELFIRE_ADMIN_PIN', '1234')
  DEFAULT_ACCOUNT_NUMBER = ENV.fetch('ANGELFIRE_ADMIN_ACCOUNT_NUMBER', '9000000001')

  def self.ensure!
    admin_user = User.find_or_initialize_by(email: DEFAULT_EMAIL)
    admin_user.first_name = 'Admin'
    admin_user.last_name = 'AngelFire'
    admin_user.role = :admin
    admin_user.pin = DEFAULT_PIN if admin_user.new_record? || admin_user.pin_digest.blank?
    admin_user.save!

    matching_accounts = Account.where(account_number: DEFAULT_ACCOUNT_NUMBER)
    matching_accounts.update_all(user_id: admin_user.id) if matching_accounts.exists?

    admin_account = matching_accounts.order(:id).first || admin_user.accounts.find_by(default: true) || admin_user.accounts.first
    admin_account ||= admin_user.accounts.create!(default: true, balance: 100_000)

    admin_account.update!(user: admin_user, default: true)
    if admin_account.account_number.blank? && matching_accounts.empty?
      admin_account.update!(account_number: DEFAULT_ACCOUNT_NUMBER)
    end

    admin_user.reload
    admin_user.update!(role: :admin)

    { user: admin_user, account: admin_account }
  end
end
