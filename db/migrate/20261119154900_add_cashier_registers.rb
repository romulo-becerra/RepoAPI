class AddCashierRegisters < ActiveRecord::Migration[8.0]
  def change
    create_table :cash_register_sessions do |t|
      t.references :user, null: false, foreign_key: true
      t.decimal :opening_balance, precision: 15, scale: 2, null: false
      t.decimal :closing_balance, precision: 15, scale: 2
      t.decimal :physical_balance, precision: 15, scale: 2
      t.decimal :difference, precision: 15, scale: 2
      t.integer :status, default: 0, null: false
      t.datetime :opened_at, null: false
      t.datetime :closed_at
      t.text :notes
      t.timestamps
    end

    create_table :receipts do |t|
      t.references :account, null: false, foreign_key: true
      t.references :transaction, null: true, foreign_key: true
      t.references :created_by, null: false, foreign_key: { to_table: :users }
      t.string :receipt_number, null: false
      t.string :operation, null: false
      t.decimal :amount, precision: 15, scale: 2, null: false
      t.text :description
      t.timestamps
    end
    add_index :receipts, :receipt_number, unique: true
  end
end
