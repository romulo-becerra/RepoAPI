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

<<<<<<< HEAD
ActiveRecord::Schema[8.0].define(version: 2026_11_19_171700) do
  create_table "account_reconciliations", force: :cascade do |t|
    t.integer "account_id", null: false
    t.integer "created_by_id", null: false
    t.decimal "reported_balance", precision: 15, scale: 2, null: false
    t.decimal "calculated_balance", precision: 15, scale: 2, null: false
    t.decimal "difference", precision: 15, scale: 2, null: false
    t.integer "status", default: 0, null: false
    t.text "notes"
    t.datetime "reconciled_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["account_id"], name: "index_account_reconciliations_on_account_id"
    t.index ["created_by_id"], name: "index_account_reconciliations_on_created_by_id"
  end

  create_table "accounting_accounts", force: :cascade do |t|
    t.string "code", null: false
    t.string "name", null: false
    t.string "account_type", null: false
    t.boolean "active", default: true, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["code"], name: "index_accounting_accounts_on_code", unique: true
  end

=======
ActiveRecord::Schema[8.0].define(version: 2026_10_24_193000) do
>>>>>>> 947e293b3a3d075ed2ce53981334da79824bf72f
  create_table "accounts", force: :cascade do |t|
    t.integer "user_id"
    t.string "account_number"
    t.decimal "balance", precision: 15, scale: 2, default: "0.0"
    t.string "clabe"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.boolean "default", default: false
    t.integer "account_type", default: 0, null: false
    t.integer "status", default: 0, null: false
    t.decimal "daily_withdraw_limit", precision: 15, scale: 2
    t.decimal "daily_transfer_limit", precision: 15, scale: 2
    t.string "account_category", default: "savings", null: false
    t.decimal "retained_balance", precision: 15, scale: 2, default: "0.0", null: false
    t.index ["status"], name: "index_accounts_on_status"
    t.index ["user_id"], name: "index_accounts_on_user_id"
  end

  create_table "api_keys", force: :cascade do |t|
    t.integer "user_id", null: false
    t.string "name", null: false
    t.string "token_digest", null: false
    t.string "token_prefix", null: false
    t.datetime "last_used_at"
    t.datetime "revoked_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["token_digest"], name: "index_api_keys_on_token_digest", unique: true
    t.index ["user_id"], name: "index_api_keys_on_user_id"
  end

<<<<<<< HEAD
  create_table "audit_logs", force: :cascade do |t|
    t.integer "user_id"
    t.string "auditable_type"
    t.integer "auditable_id"
    t.string "action", null: false
    t.text "previous_values"
    t.text "new_values"
    t.string "ip_address"
    t.text "reason"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["auditable_type", "auditable_id"], name: "index_audit_logs_on_auditable_type_and_auditable_id"
    t.index ["user_id"], name: "index_audit_logs_on_user_id"
  end

  create_table "cash_register_sessions", force: :cascade do |t|
    t.integer "user_id", null: false
    t.decimal "opening_balance", precision: 15, scale: 2, null: false
    t.decimal "closing_balance", precision: 15, scale: 2
    t.decimal "physical_balance", precision: 15, scale: 2
    t.decimal "difference", precision: 15, scale: 2
    t.integer "status", default: 0, null: false
    t.datetime "opened_at", null: false
    t.datetime "closed_at"
    t.text "notes"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_cash_register_sessions_on_user_id"
  end

=======
>>>>>>> 947e293b3a3d075ed2ce53981334da79824bf72f
  create_table "contacts", force: :cascade do |t|
    t.integer "user_id", null: false
    t.string "name", null: false
    t.string "phone", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id", "phone"], name: "index_contacts_on_user_id_and_phone", unique: true
    t.index ["user_id"], name: "index_contacts_on_user_id"
  end

<<<<<<< HEAD
  create_table "credit_requests", force: :cascade do |t|
    t.integer "user_id", null: false
    t.integer "account_id", null: false
    t.decimal "amount", precision: 15, scale: 2, null: false
    t.integer "term_months", null: false
    t.integer "status", default: 0, null: false
    t.text "reason"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["account_id"], name: "index_credit_requests_on_account_id"
    t.index ["user_id"], name: "index_credit_requests_on_user_id"
  end

  create_table "invoices", force: :cascade do |t|
    t.integer "account_id", null: false
    t.integer "created_by_id"
    t.string "invoice_number", null: false
    t.decimal "amount", precision: 15, scale: 2, null: false
    t.string "status", default: "pending", null: false
    t.text "description"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["account_id"], name: "index_invoices_on_account_id"
    t.index ["created_by_id"], name: "index_invoices_on_created_by_id"
    t.index ["invoice_number"], name: "index_invoices_on_invoice_number", unique: true
  end

  create_table "journal_entries", force: :cascade do |t|
    t.integer "created_by_id", null: false
    t.string "reference", null: false
    t.text "description"
    t.string "status", default: "pending", null: false
    t.datetime "approved_at"
    t.integer "approved_by_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["approved_by_id"], name: "index_journal_entries_on_approved_by_id"
    t.index ["created_by_id"], name: "index_journal_entries_on_created_by_id"
  end

  create_table "journal_lines", force: :cascade do |t|
    t.integer "journal_entry_id", null: false
    t.integer "accounting_account_id", null: false
    t.decimal "debit", precision: 15, scale: 2, default: "0.0", null: false
    t.decimal "credit", precision: 15, scale: 2, default: "0.0", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["accounting_account_id"], name: "index_journal_lines_on_accounting_account_id"
    t.index ["journal_entry_id"], name: "index_journal_lines_on_journal_entry_id"
  end

=======
>>>>>>> 947e293b3a3d075ed2ce53981334da79824bf72f
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

  create_table "login_events", force: :cascade do |t|
    t.integer "user_id"
    t.string "account_number", null: false
    t.string "user_name"
    t.integer "status", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "ip_address"
    t.string "device"
    t.index ["account_number"], name: "index_login_events_on_account_number"
    t.index ["created_at"], name: "index_login_events_on_created_at"
    t.index ["status"], name: "index_login_events_on_status"
    t.index ["user_id"], name: "index_login_events_on_user_id"
  end

  create_table "notifications", force: :cascade do |t|
    t.integer "user_id", null: false
    t.string "title", null: false
    t.text "message", null: false
    t.string "channel", default: "in_app", null: false
    t.datetime "read_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_notifications_on_user_id"
  end

  create_table "receipts", force: :cascade do |t|
    t.integer "account_id", null: false
    t.integer "transaction_id"
    t.integer "created_by_id", null: false
    t.string "receipt_number", null: false
    t.string "operation", null: false
    t.decimal "amount", precision: 15, scale: 2, null: false
    t.text "description"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["account_id"], name: "index_receipts_on_account_id"
    t.index ["created_by_id"], name: "index_receipts_on_created_by_id"
    t.index ["receipt_number"], name: "index_receipts_on_receipt_number", unique: true
    t.index ["transaction_id"], name: "index_receipts_on_transaction_id"
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

  create_table "support_tickets", force: :cascade do |t|
    t.integer "user_id", null: false
    t.string "subject", null: false
    t.text "description", null: false
    t.integer "status", default: 0, null: false
    t.integer "priority", default: 1, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_support_tickets_on_user_id"
  end

  create_table "transactions", force: :cascade do |t|
    t.integer "account_id", null: false
    t.integer "transaction_type", default: 0
    t.decimal "amount", default: "0.0"
    t.text "description", default: ""
    t.integer "status", default: 0
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.decimal "balance_before", precision: 15, scale: 2
    t.decimal "balance_after", precision: 15, scale: 2
    t.datetime "reversed_at"
    t.integer "reversed_by_user_id"
    t.text "reversal_reason"
    t.index ["account_id"], name: "index_transactions_on_account_id"
    t.index ["reversed_at"], name: "index_transactions_on_reversed_at"
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

  create_table "user_preferences", force: :cascade do |t|
    t.integer "user_id", null: false
    t.string "language", default: "es", null: false
    t.string "preferred_currency", default: "BOB", null: false
    t.string "timezone", default: "America/La_Paz", null: false
    t.string "theme", default: "light", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_user_preferences_on_user_id", unique: true
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
    t.boolean "active", default: true, null: false
    t.boolean "blocked", default: false, null: false
    t.date "date_of_birth"
    t.string "basic_auth_password_digest"
<<<<<<< HEAD
    t.string "password_reset_digest"
    t.datetime "password_reset_sent_at"
    t.integer "failed_login_attempts", default: 0, null: false
    t.datetime "locked_until"
    t.boolean "force_pin_change", default: false, null: false
    t.string "document_number"
    t.string "address"
=======
>>>>>>> 947e293b3a3d075ed2ce53981334da79824bf72f
    t.index ["active"], name: "index_users_on_active"
    t.index ["blocked"], name: "index_users_on_blocked"
    t.index ["document_number"], name: "index_users_on_document_number", unique: true
    t.index ["phone"], name: "index_users_on_phone", unique: true
    t.index ["role"], name: "index_users_on_role"
  end

  add_foreign_key "account_reconciliations", "accounts"
  add_foreign_key "account_reconciliations", "users", column: "created_by_id"
  add_foreign_key "accounts", "users"
  add_foreign_key "api_keys", "users", on_delete: :cascade
<<<<<<< HEAD
  add_foreign_key "audit_logs", "users"
  add_foreign_key "cash_register_sessions", "users"
  add_foreign_key "contacts", "users"
  add_foreign_key "credit_requests", "accounts"
  add_foreign_key "credit_requests", "users"
  add_foreign_key "invoices", "accounts"
  add_foreign_key "invoices", "users", column: "created_by_id"
  add_foreign_key "journal_entries", "users", column: "approved_by_id"
  add_foreign_key "journal_entries", "users", column: "created_by_id"
  add_foreign_key "journal_lines", "accounting_accounts"
  add_foreign_key "journal_lines", "journal_entries"
=======
  add_foreign_key "contacts", "users"
>>>>>>> 947e293b3a3d075ed2ce53981334da79824bf72f
  add_foreign_key "loan_installments", "loans"
  add_foreign_key "loans", "accounts"
  add_foreign_key "login_events", "users", on_delete: :nullify
  add_foreign_key "notifications", "users"
  add_foreign_key "receipts", "accounts"
  add_foreign_key "receipts", "transactions"
  add_foreign_key "receipts", "users", column: "created_by_id"
  add_foreign_key "recipients", "accounts"
  add_foreign_key "recipients", "users"
  add_foreign_key "services", "accounts"
  add_foreign_key "support_tickets", "users"
  add_foreign_key "transactions", "accounts"
  add_foreign_key "user_addresses", "users"
  add_foreign_key "user_files", "users"
  add_foreign_key "user_files", "users", column: "uploaded_by_user_id"
  add_foreign_key "user_preferences", "users"
end
