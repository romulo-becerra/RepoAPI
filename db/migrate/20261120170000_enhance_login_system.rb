class EnhanceLoginSystem < ActiveRecord::Migration[7.1]
  def change
    # Agregar columnas para mejorar el sistema de login
    add_column :users, :last_login_at, :datetime
    add_column :users, :last_login_ip, :string
    add_column :users, :remember_token, :string
    add_column :users, :active_session_token, :string

    # Crear tabla de sesiones de usuario para control de sesiones concurrentes
    create_table :user_sessions do |t|
      t.references :user, null: false, foreign_key: true
      t.string :session_token, null: false
      t.string :ip_address
      t.string :user_agent
      t.datetime :expires_at
      t.datetime :last_activity_at
      t.string :device_name
      t.integer :status, null: false, default: 0

      t.timestamps
    end

    add_index :user_sessions, :session_token, unique: true
    add_index :user_sessions, :expires_at
  end
end