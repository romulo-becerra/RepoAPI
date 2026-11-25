class SuperAdminBootstrapService
  REQUIRED_ENV = %w[
    ANGELFIRE_ADMIN_EMAIL
    ANGELFIRE_ADMIN_PIN
    ANGELFIRE_ADMIN_ACCOUNT_NUMBER
  ].freeze

  def self.ensure!
    return if User.exists?

    credentials = REQUIRED_ENV.to_h do |name|
      [ name, ENV[name].to_s.strip ]
    end
    missing = credentials.select { |_name, value| value.blank? }.keys
    raise ArgumentError, "Missing bootstrap credentials: #{missing.join(', ')}" if missing.any?

    pin = credentials.fetch("ANGELFIRE_ADMIN_PIN")
    unless pin.match?(/\A\d{4}\z/)
      raise ArgumentError, "ANGELFIRE_ADMIN_PIN must contain exactly 4 digits"
    end

    account_number = credentials.fetch("ANGELFIRE_ADMIN_ACCOUNT_NUMBER")
    if Account.exists?(account_number: account_number)
      raise ArgumentError, "ANGELFIRE_ADMIN_ACCOUNT_NUMBER is already in use"
    end

    user = nil
    account = nil
    User.transaction do
      next if User.exists?
      if Account.exists?(account_number: account_number)
        raise ArgumentError, "ANGELFIRE_ADMIN_ACCOUNT_NUMBER is already in use"
      end

      user = User.new(
        first_name: "Super",
        last_name: "Admin",
        email: credentials.fetch("ANGELFIRE_ADMIN_EMAIL"),
        pin: pin,
        role: :super_admin
      )
      user.default_account_number = account_number
      user.save!
      account = user.accounts.find_by!(default: true)
    end

    return unless user

    { user: user.reload, account: account.reload }
  end
end
