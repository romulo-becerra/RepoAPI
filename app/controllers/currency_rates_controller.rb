class CurrencyRatesController < ApplicationController
  skip_before_action :authenticate_request

  def index
    payload = Rails.cache.fetch('bcb_currency_rates_v1', expires_in: 6.hours) do
      BcbExchangeRatesService.new.call
    end

    render json: payload, status: :ok
  end
end
