class AddFinancialControls < ActiveRecord::Migration[8.0]
  def change
    add_column :accounts, :daily_withdraw_limit, :decimal, precision: 15, scale: 2
    add_column :accounts, :daily_transfer_limit, :decimal, precision: 15, scale: 2

    add_column :users, :password_reset_digest, :string
    add_column :users, :password_reset_sent_at, :datetime

    create_table :account_reconciliations do |t|
      t.references :account, null: false, foreign_key: true
      t.references :created_by, null: false, foreign_key: { to_table: :users }
      t.decimal :reported_balance, precision: 15, scale: 2, null: false
      t.decimal :calculated_balance, precision: 15, scale: 2, null: false
      t.decimal :difference, precision: 15, scale: 2, null: false
      t.integer :status, default: 0, null: false
      t.text :notes
      t.datetime :reconciled_at
      t.timestamps
    end

    create_table :audit_logs do |t|
      t.references :user, null: true, foreign_key: true
      t.string :auditable_type
      t.integer :auditable_id
      t.string :action, null: false
      t.text :previous_values
      t.text :new_values
      t.string :ip_address
      t.text :reason
      t.timestamps
    end

    add_index :audit_logs, [:auditable_type, :auditable_id]
  end
end
