module Manager
  class AccountingController < ApplicationController
    before_action :require_manager!

    def accounts
      render json: AccountingAccount.order(:code).map { |account|
        account.attributes.slice("id", "code", "name", "account_type", "active")
      }, status: :ok
    end

    def create_account
      account = AccountingAccount.create!(code: params[:code], name: params[:name], account_type: params[:account_type])
      AuditLog.record!(action: "create_accounting_account", auditable: account)
      render json: account, status: :created
    rescue ActiveRecord::RecordInvalid => error
      render json: { errors: error.record.errors.full_messages }, status: :unprocessable_entity
    end

    def journal_entries
      entries = JournalEntry.includes(:journal_lines, :created_by).order(created_at: :desc)
      render json: entries.map { |entry|
        {
          id: entry.id,
          reference: entry.reference,
          description: entry.description,
          status: entry.status,
          debit: entry.journal_lines.sum(&:debit).to_f,
          credit: entry.journal_lines.sum(&:credit).to_f
        }
      }, status: :ok
    end

    def create_journal_entry
      entry = JournalEntry.new(created_by: current_user, reference: params[:reference], description: params[:description], status: "pending")
      ActiveRecord::Base.transaction do
        entry.save!
        Array(params[:lines]).each do |line|
          accounting_account = AccountingAccount.find(line[:account_id] || line["account_id"])
          entry.journal_lines.create!(
            accounting_account: accounting_account,
            debit: line[:debit].presence || line["debit"] || 0,
            credit: line[:credit].presence || line["credit"] || 0
          )
        end
        entry.validate!
        AuditLog.record!(action: "create_journal_entry", auditable: entry)
      end
      render json: { id: entry.id, reference: entry.reference, status: entry.status }, status: :created
    rescue ActiveRecord::RecordInvalid, ActiveRecord::RecordNotFound => error
      render json: { errors: error.respond_to?(:record) ? error.record.errors.full_messages : error.message }, status: :unprocessable_entity
    end

    def approve_journal_entry
      entry = JournalEntry.find(params[:id])
      entry.update!(status: "approved", approved_at: Time.current, approved_by: current_user)
      AuditLog.record!(action: "approve_journal_entry", auditable: entry)
      render json: { id: entry.id, status: entry.status }, status: :ok
    end

    def reports
      transactions = Transaction.where(status: :completed)
      render json: {
        balance_general: Account.sum(:balance).to_f,
        estado_resultados: {
          ingresos: transactions.where(transaction_type: %i[deposit atm_deposit]).sum(:amount).to_f,
          egresos: transactions.where(transaction_type: %i[withdraw transfer service_payment loan_payment atm_withdrawal]).sum(:amount).to_f
        },
        flujo_caja: {
          entradas: transactions.where(transaction_type: %i[deposit atm_deposit]).sum(:amount).to_f,
          salidas: transactions.where(transaction_type: %i[withdraw atm_withdrawal]).sum(:amount).to_f
        },
        libro_diario: transactions.order(created_at: :desc).limit(200).map { |transaction|
          { id: transaction.id, fecha: transaction.created_at, tipo: transaction.transaction_type, monto: transaction.amount.to_f }
        },
        libro_mayor: Account.order(:id).map { |account|
          { account_id: account.id, account_number: account.account_number, balance: account.balance.to_f }
        }
      }, status: :ok
    end
  end
end
