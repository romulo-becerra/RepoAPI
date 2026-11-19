class AddAdminControls < ActiveRecord::Migration[8.0]
  def change
    add_column :users, :failed_login_attempts, :integer, default: 0, null: false
    add_column :users, :locked_until, :datetime
    add_column :users, :force_pin_change, :boolean, default: false, null: false

    add_column :login_events, :ip_address, :string
    add_column :login_events, :device, :string

    create_table :invoices do |t|
      t.references :account, null: false, foreign_key: true
      t.references :created_by, null: true, foreign_key: { to_table: :users }
      t.string :invoice_number, null: false
      t.decimal :amount, precision: 15, scale: 2, null: false
      t.string :status, default: "pending", null: false
      t.text :description
      t.timestamps
    end
    add_index :invoices, :invoice_number, unique: true

    create_table :accounting_accounts do |t|
      t.string :code, null: false
      t.string :name, null: false
      t.string :account_type, null: false
      t.boolean :active, default: true, null: false
      t.timestamps
    end
    add_index :accounting_accounts, :code, unique: true

    create_table :journal_entries do |t|
      t.references :created_by, null: false, foreign_key: { to_table: :users }
      t.string :reference, null: false
      t.text :description
      t.string :status, default: "pending", null: false
      t.datetime :approved_at
      t.references :approved_by, null: true, foreign_key: { to_table: :users }
      t.timestamps
    end

    create_table :journal_lines do |t|
      t.references :journal_entry, null: false, foreign_key: true
      t.references :accounting_account, null: false, foreign_key: true
      t.decimal :debit, precision: 15, scale: 2, default: "0", null: false
      t.decimal :credit, precision: 15, scale: 2, default: "0", null: false
      t.timestamps
    end
  end
end
