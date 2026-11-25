require "csv"

module Manager
  class LoginsController < ApplicationController
    before_action :require_manager!

    PERIODS = %w[day week month].freeze
    STATUSES = %w[success failure blocked].freeze
    MAX_PER_PAGE = 50
    DEFAULT_PER_PAGE = 10

    CSV_HEADERS = %w[created_at status user_id user_name account_number].freeze

    def index
      events = filtered_events
      total = events.count
      total_pages = [ (total.to_f / per_page).ceil, 1 ].max
      page = [ [ params[:page].to_i, 1 ].max, total_pages ].min
      records = events.offset((page - 1) * per_page).limit(per_page)

      render json: {
        period: period,
        date: reference_date.iso8601,
        range: { from: range.begin.iso8601, to: range.end.iso8601 },
        status: status_filter.presence || "all",
        page: page,
        per_page: per_page,
        total: total,
        total_pages: total_pages,
        has_prev: page > 1,
        has_next: page < total_pages,
        totals_by_status: totals_by_status,
        logins: records.map { |event| serialize(event) }
      }, status: :ok
    end

    def download
      events = filtered_events
      csv_data = CSV.generate(headers: true) do |csv|
        csv << CSV_HEADERS
        events.reorder(:id).find_each do |event|
          row = serialize(event)
          csv << CSV_HEADERS.map { |header| safe_csv_value(row[header.to_sym]) }
        end
      end

      send_data csv_data,
                filename: "user_logins_#{period}_#{reference_date.iso8601}.csv",
                type: "text/csv; charset=utf-8"
    end

    private

    def filtered_events
      scope = LoginEvent.where(created_at: range).order(created_at: :desc)
      scope = scope.where(status: status_filter) if status_filter.present?
      scope
    end

    def period
      value = params[:period].to_s
      PERIODS.include?(value) ? value : "day"
    end

    def reference_date
      @reference_date ||= begin
        Date.iso8601(params[:date].to_s)
      rescue Date::Error, TypeError
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

    def status_filter
      value = params[:status].to_s
      STATUSES.include?(value) ? value : nil
    end

    def totals_by_status
      STATUSES.index_with do |status|
        LoginEvent.where(created_at: range, status: status).count
      end
    end

    def serialize(event)
      {
        id: event.id,
        created_at: event.created_at,
        status: event.status,
        user_id: event.user_id,
        user_name: event.user_name,
        account_number: event.account_number
      }
    end

    def safe_csv_value(value)
      return value unless value.is_a?(String) && value.match?(/\A[=+\-@\t\r]/)

      "'#{value}"
    end
  end
end
