# frozen_string_literal: true

require_relative "api_test_framework/config"
require_relative "api_test_framework/response"
require_relative "api_test_framework/client"
require_relative "api_test_framework/session"

module ApiTestFramework
  class Error < StandardError; end
end
