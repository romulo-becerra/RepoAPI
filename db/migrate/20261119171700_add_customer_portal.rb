class AddCustomerPortal < ActiveRecord::Migration[8.0]
  def change
    create_table :support_tickets do |t|
      t.references :user, null: false, foreign_key: true
      t.string :subject, null: false
      t.text :description, null: false
      t.integer :status, default: 0, null: false
      t.integer :priority, default: 1, null: false
      t.timestamps
    end

    create_table :notifications do |t|
      t.references :user, null: false, foreign_key: true
      t.string :title, null: false
      t.text :message, null: false
      t.string :channel, default: "in_app", null: false
      t.datetime :read_at
      t.timestamps
    end

    create_table :user_preferences do |t|
      t.references :user, null: false, foreign_key: true, index: { unique: true }
      t.string :language, default: "es", null: false
      t.string :preferred_currency, default: "BOB", null: false
      t.string :timezone, default: "America/La_Paz", null: false
      t.string :theme, default: "light", null: false
      t.timestamps
    end

    create_table :credit_requests do |t|
      t.references :user, null: false, foreign_key: true
      t.references :account, null: false, foreign_key: true
      t.decimal :amount, precision: 15, scale: 2, null: false
      t.integer :term_months, null: false
      t.integer :status, default: 0, null: false
      t.text :reason
      t.timestamps
    end
  end
end
