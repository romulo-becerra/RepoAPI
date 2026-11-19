class CreateContacts < ActiveRecord::Migration[8.0]
  def change
    unless table_exists?(:contacts)
      create_table :contacts do |t|
        t.references :user, null: false, foreign_key: true
        t.string :name, null: false
        t.string :phone, null: false

        t.timestamps
      end
    end

    add_index :contacts, [ :user_id, :phone ], unique: true, if_not_exists: true
  end
end
