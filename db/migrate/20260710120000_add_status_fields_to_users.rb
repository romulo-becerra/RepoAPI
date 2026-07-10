class AddStatusFieldsToUsers < ActiveRecord::Migration[8.0]
  def change
    add_column :users, :active, :boolean, null: false, default: true
    add_column :users, :blocked, :boolean, null: false, default: false

    add_index :users, :active
    add_index :users, :blocked
  end
end
