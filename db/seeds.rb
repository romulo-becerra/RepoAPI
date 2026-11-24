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

if Rails.env.production?
  bootstrap_result = SuperAdminBootstrapService.ensure!
  message = bootstrap_result ? "Super admin bootstrapped." : "Bootstrap skipped; users already exist."
  puts "[seeds] #{message}"
else
  admin_result = AdminSeedService.ensure!
  admin_user = admin_result[:user]
  admin_account = admin_result[:account]
  puts "[seeds] Development admin ready for account #{admin_account.account_number}."
end
