class AddFinancialIntegrityFields < ActiveRecord::Migration[8.0]
  def change
    add_column :accounts, :status, :integer, default: 0, null: false
    add_column :transactions, :balance_before, :decimal, precision: 15, scale: 2
    add_column :transactions, :balance_after, :decimal, precision: 15, scale: 2
    add_column :transactions, :reversed_at, :datetime
    add_column :transactions, :reversed_by_user_id, :integer
    add_column :transactions, :reversal_reason, :text
    add_index :accounts, :status
    add_index :transactions, :reversed_at
  end
end
