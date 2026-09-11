# frozen_string_literal: true

module ApiTestFramework
  class Config
    attr_reader :base_url, :open_timeout, :timeout, :skip_if_down

    def initialize(
      base_url: ENV.fetch("API_BASE_URL", "http://localhost:3001"),
      open_timeout: ENV.fetch("API_OPEN_TIMEOUT", "5").to_i,
      timeout: ENV.fetch("API_TIMEOUT", "15").to_i,
      skip_if_down: ENV.fetch("API_SKIP_IF_DOWN", "0") == "1"
    )
      @base_url = base_url.chomp("/")
      @open_timeout = open_timeout
      @timeout = timeout
      @skip_if_down = skip_if_down
    end
  end
end
