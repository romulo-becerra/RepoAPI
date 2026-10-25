class AddBasicAuthPasswordDigestToUsers < ActiveRecord::Migration[8.0]
  def change
    add_column :users, :basic_auth_password_digest, :string
  end
end
