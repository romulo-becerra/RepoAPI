class CreateLoansAndLoanInstallments < ActiveRecord::Migration[8.0]
  def change
    create_table :loans do |t|
      t.references :account, null: false, foreign_key: true
      t.decimal :amount, precision: 15, scale: 2, null: false
      t.decimal :annual_interest_rate, precision: 5, scale: 2, null: false
      t.integer :term_months, null: false
      t.decimal :monthly_payment, precision: 15, scale: 2, null: false
      t.decimal :outstanding_principal, precision: 15, scale: 2, null: false
      t.date :first_due_date, null: false
      t.datetime :disbursed_at, null: false
      t.integer :status, null: false, default: 0

      t.timestamps
    end

    create_table :loan_installments do |t|
      t.references :loan, null: false, foreign_key: true
      t.integer :installment_number, null: false
      t.date :due_date, null: false
      t.decimal :amount, precision: 15, scale: 2, null: false
      t.decimal :principal_amount, precision: 15, scale: 2, null: false
      t.decimal :interest_amount, precision: 15, scale: 2, null: false
      t.decimal :remaining_principal, precision: 15, scale: 2, null: false
      t.decimal :remaining_interest, precision: 15, scale: 2, null: false
      t.decimal :paid_amount, precision: 15, scale: 2, null: false, default: 0
      t.datetime :paid_at
      t.integer :status, null: false, default: 0

      t.timestamps
    end

    add_index :loan_installments, [:loan_id, :installment_number], unique: true
  end
end
