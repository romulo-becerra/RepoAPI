require 'rails_helper'

RSpec.describe SuperAdminBootstrapService do
  let(:account_number) { "98#{SecureRandom.random_number(10**8).to_s.rjust(8, '0')}" }

  before do
    @original_environment = described_class::REQUIRED_ENV.to_h do |name|
      [ name, ENV[name] ]
    end
    ENV['ANGELFIRE_ADMIN_EMAIL'] = "super.admin.#{SecureRandom.hex(4)}@example.com"
    ENV['ANGELFIRE_ADMIN_PIN'] = '2468'
    ENV['ANGELFIRE_ADMIN_ACCOUNT_NUMBER'] = account_number
  end

  after do
    @original_environment.each do |name, value|
      value.nil? ? ENV.delete(name) : ENV[name] = value
    end
  end

  describe '.ensure!' do
    it 'creates a super admin with credentials from the environment when there are no users' do
      result = nil

      expect { result = described_class.ensure! }.to change(User, :count).by(1)

      user = result.fetch(:user)
      expect(user.role).to eq('super_admin')
      expect(user.authenticate_pin('2468')).to be_truthy
      expect(result.fetch(:account).account_number).to eq(account_number)
    end

    it 'does not create or promote an account when a user already exists' do
      existing_user = create(:user, pin: '1234')

      expect(described_class.ensure!).to be_nil
      expect(existing_user.reload.role).to eq('customer')
      expect(User.count).to eq(1)
    end

    it 'requires an explicit PIN when bootstrapping' do
      ENV.delete('ANGELFIRE_ADMIN_PIN')

      expect { described_class.ensure! }
        .to raise_error(ArgumentError, /ANGELFIRE_ADMIN_PIN/)
      expect(User.count).to eq(0)
    end
  end
end
