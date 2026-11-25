# == Schema Information
#
# Table name: accounts
#
#  id             :integer          not null, primary key
#  user_id        :integer
#  account_number :string
#  balance        :integer          default(0)
#  clabe          :string
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#  default        :boolean          default(FALSE)
#  account_type   :integer          default("user"), not null
#
FactoryBot.define do
  factory :account do
    user
    sequence(:account_number) { |n| (8_000_000_000 + n).to_s }
    balance        { 1_000 }
    sequence(:clabe) { |n| (800_000_000_000_000_000 + n).to_s }
  end
end
