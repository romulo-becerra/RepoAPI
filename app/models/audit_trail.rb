module AuditTrail
  extend ActiveSupport::Concern

  included do
    after_create -> { AuditLog.record!(action: "create", auditable: self, new_values: audited_attributes) }
    after_update -> {
      previous_values = previous_changes.transform_values { |old_value, _new_value| old_value }
      AuditLog.record!(action: "update", auditable: self, previous_values: previous_values, new_values: audited_attributes)
    }
  end

  private

  def audited_attributes
    attributes.except("pin_digest", "password_reset_digest")
  end

end
