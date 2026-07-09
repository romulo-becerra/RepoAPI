FactoryBot.define do
  factory :recipient do
    user
    account
    name { 'Destinatario' }
  end
end
