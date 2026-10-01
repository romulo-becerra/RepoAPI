require "csv"

module Manager
  # Operational log for the admin view: lists the money movements performed in
  # the system (deposits, withdrawals, loan payments, service payments and
  # transfers) for a day, week or month, including who performed each one.
  class OperationsController < ApplicationController
    before_action :require_manager!

    PERIODS = %w[day week month].freeze
    DEFAULT_PERIOD = "day".freeze
    MAX_PER_PAGE = 50
    DEFAULT_PER_PAGE = 10

    # Groupings reused by the client-facing transaction filters.
    TYPE_GROUPS = {
      "credit" => %i[deposit atm_deposit],
      "debit" => %i[withdraw transfer service_payment loan_payment atm_withdrawal]
    }.freeze

    CSV_HEADERS = [
      "id",
      "created_at",
      "transaction_type",
      "amount",
      "description",
      "status",
      "account_number",
      "user_id",
      "user_name",
      "performed_by_role",
      "performed_by_user_id",
      "performed_by_name"
    ].freeze

    def index
      operations = filtered_operations
      total = operations.count
      total_pages = [ (total.to_f / per_page).ceil, 1 ].max
      page = [ [ params[:page].to_i, 1 ].max, total_pages ].min
      records = operations.offset((page - 1) * per_page).limit(per_page)

      render json: {
        period: period,
        date: reference_date.iso8601,
        range: { from: range.begin.iso8601, to: range.end.iso8601 },
        page: page,
        per_page: per_page,
        total: total,
        total_pages: total_pages,
        has_prev: page > 1,
        has_next: page < total_pages,
        total_amount: operations.sum(:amount).to_f,
        operations: records.map { |transaction| serialize(transaction) }
      }, status: :ok
    end

    def download
      operations = filtered_operations

      csv_data = CSV.generate(headers: true) do |csv|
        csv << CSV_HEADERS
        operations.find_each do |transaction|
          row = serialize(transaction)
          csv << CSV_HEADERS.map { |header| row[header.to_sym] }
        end
      end

      send_data csv_data,
                filename: "operations_#{period}_#{reference_date.iso8601}.csv",
                type: "text/csv; charset=utf-8"
    end

    private

    def filtered_operations
      scope = Transaction.includes(account: :user).where(created_at: range).order(created_at: :desc)

      types = transaction_types
      scope = scope.where(transaction_type: types) if types.any?

      apply_actor_filter(scope)
    end

    def period
      value = params[:period].to_s
      PERIODS.include?(value) ? value : DEFAULT_PERIOD
    end

    # The reference date is the day the query is made from; the period is
    # expanded around it (that whole day, its week or its month).
    def reference_date
      @reference_date ||= begin
        Date.parse(params[:date].to_s)
      rescue ArgumentError, TypeError
        Date.current
      end
    end

    def range
      @range ||= case period
      when "week"
                   reference_date.beginning_of_week.beginning_of_day..reference_date.end_of_week.end_of_day
      when "month"
                   reference_date.beginning_of_month.beginning_of_day..reference_date.end_of_month.end_of_day
      else
                   reference_date.beginning_of_day..reference_date.end_of_day
      end
    end

    def per_page
      value = params[:per_page].to_i
      value = DEFAULT_PER_PAGE if value <= 0
      [ value, MAX_PER_PAGE ].min
    end

    def transaction_types
      filter = params[:operation_type].to_s
      return [] if filter.blank? || filter == "all"
      return TYPE_GROUPS[filter] if TYPE_GROUPS.key?(filter)
      return [ filter.to_sym ] if Transaction.transaction_types.key?(filter)

      []
    end

    def apply_actor_filter(scope)
      filter = params[:performed_by].to_s
      return scope if filter.blank? || filter == "all"

      if %w[manager admin].include?(filter)
        return scope.where("description LIKE ? OR description LIKE ?", "[actor:manager%", "[actor:admin%")
      end

      return scope.where("description LIKE ?", "[actor:user%") if filter == "user"
      return scope.where("description LIKE ?", "[actor:cashier%") if filter == "cashier"

      scope
    end

    def serialize(transaction)
      actor = TransactionService.parse_actor_from_description(transaction.description)
      account = transaction.account
      user = account&.user

      {
        id: transaction.id,
        created_at: transaction.created_at,
        transaction_type: transaction.transaction_type,
        amount: transaction.amount.to_f,
        description: actor[:detail],
        status: transaction.status,
        account_id: transaction.account_id,
        account_number: account&.account_number,
        user_id: user&.id,
        user_name: user&.to_s,
        performed_by_role: actor[:role],
        performed_by_user_id: actor[:user_id],
        performed_by_name: actor[:name],
        performed_by_label: actor[:label]
      }
    end
  end
end
