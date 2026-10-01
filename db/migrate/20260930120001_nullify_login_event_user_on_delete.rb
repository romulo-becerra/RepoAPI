class NullifyLoginEventUserOnDelete < ActiveRecord::Migration[8.0]
  def change
    remove_foreign_key :login_events, :users
    add_foreign_key :login_events, :users, on_delete: :nullify
  end
end
