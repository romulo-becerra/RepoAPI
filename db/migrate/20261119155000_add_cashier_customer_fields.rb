class AddCashierCustomerFields < ActiveRecord::Migration[8.0]
  def change
    add_column :users, :document_number, :string
    add_column :users, :address, :string
    add_column :accounts, :account_category, :string, default: "savings", null: false
    add_column :accounts, :retained_balance, :decimal, precision: 15, scale: 2, default: "0", null: false
    add_index :users, :document_number, unique: true
  end
end
