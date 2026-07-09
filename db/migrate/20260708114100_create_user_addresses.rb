class CreateUserAddresses < ActiveRecord::Migration[8.0]
  def change
    unless table_exists?(:user_addresses)
      create_table :user_addresses do |t|
        t.references :user, null: false, foreign_key: true
        t.string :country, null: false
        t.string :city, null: false
        t.string :province, null: false
        t.string :street, null: false
        t.string :street_number
        t.string :district
        t.string :postal_code
        t.string :reference

        t.timestamps
      end
    end

    add_index :user_addresses, :user_id, unique: true, if_not_exists: true
  end
end
