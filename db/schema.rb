# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.0].define(version: 2026_07_08_114200) do
  create_table "accounts", force: :cascade do |t|
    t.integer "user_id"
    t.string "account_number"
    t.integer "balance", default: 0
    t.string "clabe"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.boolean "default", default: false
    t.integer "account_type", default: 0, null: false
    t.index ["user_id"], name: "index_accounts_on_user_id"
  end

  create_table "loan_installments", force: :cascade do |t|
    t.integer "loan_id", null: false
    t.integer "installment_number", null: false
    t.date "due_date", null: false
    t.decimal "amount", precision: 15, scale: 2, null: false
    t.decimal "principal_amount", precision: 15, scale: 2, null: false
    t.decimal "interest_amount", precision: 15, scale: 2, null: false
    t.decimal "remaining_principal", precision: 15, scale: 2, null: false
    t.decimal "remaining_interest", precision: 15, scale: 2, null: false
    t.decimal "paid_amount", precision: 15, scale: 2, default: "0.0", null: false
    t.datetime "paid_at"
    t.integer "status", default: 0, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["loan_id", "installment_number"], name: "index_loan_installments_on_loan_id_and_installment_number", unique: true
    t.index ["loan_id"], name: "index_loan_installments_on_loan_id"
  end

  create_table "loans", force: :cascade do |t|
    t.integer "account_id", null: false
    t.decimal "amount", precision: 15, scale: 2, null: false
    t.decimal "annual_interest_rate", precision: 5, scale: 2, null: false
    t.integer "term_months", null: false
    t.decimal "monthly_payment", precision: 15, scale: 2, null: false
    t.decimal "outstanding_principal", precision: 15, scale: 2, null: false
    t.date "first_due_date", null: false
    t.datetime "disbursed_at", null: false
    t.integer "status", default: 0, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["account_id"], name: "index_loans_on_account_id"
  end

  create_table "recipients", force: :cascade do |t|
    t.integer "user_id", null: false
    t.string "name"
    t.integer "account_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["account_id"], name: "index_recipients_on_account_id"
    t.index ["user_id"], name: "index_recipients_on_user_id"
  end

  create_table "services", force: :cascade do |t|
    t.string "name"
    t.string "description"
    t.integer "account_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["account_id"], name: "index_services_on_account_id"
  end

  create_table "transactions", force: :cascade do |t|
    t.integer "account_id", null: false
    t.integer "transaction_type", default: 0
    t.decimal "amount", default: "0.0"
    t.text "description", default: ""
    t.integer "status", default: 0
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["account_id"], name: "index_transactions_on_account_id"
  end

  create_table "user_addresses", force: :cascade do |t|
    t.integer "user_id", null: false
    t.string "country", null: false
    t.string "city", null: false
    t.string "province", null: false
    t.string "street", null: false
    t.string "street_number"
    t.string "district"
    t.string "postal_code"
    t.string "reference"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_user_addresses_on_user_id"
  end

  create_table "user_files", force: :cascade do |t|
    t.integer "user_id", null: false
    t.integer "uploaded_by_user_id"
    t.string "original_filename", null: false
    t.string "stored_filename", null: false
    t.string "content_type", null: false
    t.integer "file_size", default: 0, null: false
    t.string "storage_path", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_user_files_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "first_name"
    t.string "last_name"
    t.string "pin_digest"
    t.boolean "biometric_enabled"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "email"
    t.integer "role", default: 0, null: false
    t.string "phone"
    t.index ["phone"], name: "index_users_on_phone", unique: true
    t.index ["role"], name: "index_users_on_role"
  end

  add_foreign_key "accounts", "users"
  add_foreign_key "loan_installments", "loans"
  add_foreign_key "loans", "accounts"
  add_foreign_key "recipients", "accounts"
  add_foreign_key "recipients", "users"
  add_foreign_key "services", "accounts"
  add_foreign_key "transactions", "accounts"
  add_foreign_key "user_addresses", "users"
  add_foreign_key "user_files", "users"
  add_foreign_key "user_files", "users", column: "uploaded_by_user_id"
end
