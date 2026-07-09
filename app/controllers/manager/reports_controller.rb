module Manager
  class ReportsController < ApplicationController
    before_action :require_manager!

    def overview
      total_balance = Account.sum(:balance)
      total_accounts = Account.count

      render json: {
        generated_at: Time.current,
        users: {
          total: User.count,
          customers: User.customer.count,
          managers: User.manager.count
        },
        accounts: {
          total: total_accounts,
          total_balance: total_balance,
          average_balance: total_accounts.zero? ? 0 : (total_balance.to_f / total_accounts).round(2)
        },
        transactions: {
          total: Transaction.count,
          today: Transaction.where(created_at: Time.current.beginning_of_day..Time.current.end_of_day).count,
          deposits: Transaction.where(transaction_type: :deposit).count,
          withdrawals: Transaction.where(transaction_type: :withdraw).count,
          atm_operations: Transaction.where(transaction_type: %i[atm_deposit atm_withdrawal]).count,
          service_payments: Transaction.where(transaction_type: :service_payment).count,
          loan_payments: Transaction.where(transaction_type: :loan_payment).count
        },
        loans: {
          total: Loan.count,
          active: Loan.active.count,
          completed: Loan.completed.count,
          cancelled: Loan.cancelled.count,
          total_disbursed: Loan.sum(:amount).to_f,
          total_outstanding_principal: Loan.sum(:outstanding_principal).to_f,
          overdue_installments: LoanInstallment.where(status: %i[pending partial]).where("due_date < ?", Date.current).count
        }
      }, status: :ok
    end

    def loans
      status_filter = params[:status].presence
      relation = Loan.includes(account: :user).order(created_at: :desc)
      relation = relation.where(status: status_filter) if status_filter.present?

      render json: {
        generated_at: Time.current,
        total: relation.count,
        loans: relation.limit(200).map do |loan|
          {
            id: loan.id,
            status: loan.status,
            amount: loan.amount.to_f,
            outstanding_principal: loan.outstanding_principal.to_f,
            annual_interest_rate: loan.annual_interest_rate.to_f,
            term_months: loan.term_months,
            account_id: loan.account_id,
            account_number: loan.account.account_number,
            user_id: loan.account.user_id,
            customer_name: loan.account.user.to_s,
            created_at: loan.created_at
          }
        end
      }, status: :ok
    end

    def accounts_activity
      days = params[:days].to_i
      days = 30 if days <= 0

      start_date = days.days.ago.beginning_of_day
      result = Account
               .joins(:transactions)
               .where(transactions: { created_at: start_date..Time.current })
               .group("accounts.id")
               .select("accounts.id, accounts.account_number, accounts.balance, COUNT(transactions.id) AS tx_count, SUM(transactions.amount) AS tx_amount")
               .order("tx_count DESC")
               .limit(100)

      render json: {
        generated_at: Time.current,
        window_days: days,
        accounts: result.map do |row|
          {
            account_id: row.id,
            account_number: row.account_number,
            balance: row.balance,
            transactions_count: row.tx_count.to_i,
            transactions_amount: row.tx_amount.to_f
          }
        end
      }, status: :ok
    end
  end
end
