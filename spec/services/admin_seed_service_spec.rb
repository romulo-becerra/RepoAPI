require 'rails_helper'

RSpec.describe AdminSeedService do
  describe '.ensure!' do
    before do
      Account.where(account_number: AdminSeedService::DEFAULT_ACCOUNT_NUMBER).delete_all
      User.where(email: AdminSeedService::DEFAULT_EMAIL).destroy_all
      User.where('email LIKE ?', 'manager.seed%').destroy_all
    end

    it 'reassigns the seeded admin account and keeps the admin role' do
      manager_email = "manager.seed.#{SecureRandom.hex(4)}@example.com"
      manager = create(:user, role: :manager, email: manager_email, pin: '1234')
      manager_account = create(:account, user: manager, account_number: AdminSeedService::DEFAULT_ACCOUNT_NUMBER, default: true, balance: 10_000)

      described_class.ensure!

      admin_user = User.find_by(email: AdminSeedService::DEFAULT_EMAIL)
      expect(admin_user).to be_present
      expect(admin_user.role).to eq('admin')
      expect(manager_account.reload.user_id).to eq(admin_user.id)
      expect(admin_user.accounts.where(account_number: AdminSeedService::DEFAULT_ACCOUNT_NUMBER).exists?).to be(true)
    end
  end
end
