class CreateUserFiles < ActiveRecord::Migration[8.0]
  def change
    unless table_exists?(:user_files)
      create_table :user_files do |t|
        t.references :user, null: false, foreign_key: true
        t.integer :uploaded_by_user_id
        t.string :original_filename, null: false
        t.string :stored_filename, null: false
        t.string :content_type, null: false
        t.integer :file_size, null: false, default: 0
        t.string :storage_path, null: false

        t.timestamps
      end
    end

    add_foreign_key :user_files, :users, column: :uploaded_by_user_id, if_not_exists: true
  end
end
