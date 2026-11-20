class AuditLog < ApplicationRecord
  belongs_to :user, optional: true

  validates :action, presence: true

  def self.record!(action:, auditable: nil, previous_values: nil, new_values: nil, reason: nil)
    create!(
      user: Current.user,
      auditable_type: auditable&.class&.name,
      auditable_id: auditable&.id,
      action: action,
      previous_values: previous_values.present? ? previous_values.to_json : nil,
      new_values: new_values.present? ? new_values.to_json : nil,
      ip_address: Current.ip_address,
      reason: reason
    )
  end
end
