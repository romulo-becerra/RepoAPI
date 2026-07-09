# == Schema Information
#
# Table name: users
#
#  id                :integer          not null, primary key
#  first_name        :string
#  last_name         :string
#  pin_digest        :string
#  biometric_enabled :boolean
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#  email             :string
#
FactoryBot.define do
  factory :user do
    first_name { "Admin" }
    last_name  { "User" }
    sequence(:email) { |n| "email#{n}@example.com" }
    pin { "1234" }
  end
end
