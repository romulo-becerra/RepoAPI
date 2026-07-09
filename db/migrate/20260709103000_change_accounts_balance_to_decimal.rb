class ChangeAccountsBalanceToDecimal < ActiveRecord::Migration[8.0]
  def up
    change_column :accounts, :balance, :decimal, precision: 15, scale: 2, default: 0.0
  end

  def down
    change_column :accounts, :balance, :integer, default: 0
  end
end
