class CreateLoginEvents < ActiveRecord::Migration[8.0]
  def change
    create_table :login_events do |t|
      t.references :user, foreign_key: true, null: true
      t.string :account_number, null: false
      t.string :user_name
      t.integer :status, null: false

      t.timestamps
    end

    add_index :login_events, :created_at
    add_index :login_events, :status
    add_index :login_events, :account_number
  end
end
