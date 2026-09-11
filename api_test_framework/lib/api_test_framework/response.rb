# frozen_string_literal: true

require "json"

module ApiTestFramework
  class Response
    attr_reader :status, :headers, :raw_body, :elapsed_ms

    def initialize(status:, headers:, body:, elapsed_ms:)
      @status = status
      @headers = headers
      @raw_body = body.to_s
      @elapsed_ms = elapsed_ms
    end

    def json
      return {} if raw_body.strip.empty?

      @json ||= JSON.parse(raw_body)
    rescue JSON::ParserError
      raise Error, "Response body is not valid JSON: #{raw_body.byteslice(0, 200)}"
    end

    def success?
      status.between?(200, 299)
    end

    def [](key)
      json.is_a?(Hash) ? json[key.to_s] : nil
    end
  end
end
