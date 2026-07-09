# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end

# Service catalog
[
  { name: 'Agua', description: 'Pago del servicio de agua' },
  { name: 'Luz', description: 'Pago del servicio de luz' },
  { name: 'Internet', description: 'Pago del servicio de internet' }
].each do |service_data|
  service = Service.find_or_initialize_by(name: service_data[:name])
  service.description = service_data[:description]
  service.account ||= Account.create!(balance: 0, account_type: :service)
  service.save!
end

# Default manager/admin user
admin_email = ENV.fetch('ANGELFIRE_ADMIN_EMAIL', 'admin@angelfire.local')
admin_pin = ENV.fetch('ANGELFIRE_ADMIN_PIN', '1234')
desired_account_number = ENV.fetch('ANGELFIRE_ADMIN_ACCOUNT_NUMBER', '9000000001')

admin_user = User.find_or_initialize_by(email: admin_email)
admin_user.first_name = 'Admin'
admin_user.last_name = 'AngelFire'
admin_user.role = :manager
admin_user.pin = admin_pin if admin_user.new_record?
admin_user.pin = admin_pin if admin_user.persisted? && admin_user.pin_digest.blank?
admin_user.save!

admin_account = admin_user.accounts.find_by(default: true) || admin_user.accounts.first
unless admin_account
  admin_account = admin_user.accounts.create!(default: true, balance: 100_000)
end

if Account.where.not(id: admin_account.id).exists?(account_number: desired_account_number)
  puts "[seeds] Admin account number '#{desired_account_number}' already in use."
else
  admin_account.update!(account_number: desired_account_number)
end

puts "[seeds] Admin user ready: #{admin_email} / PIN #{admin_pin} / account #{admin_account.account_number}"
