# frozen_string_literal: true

require "faraday"
require "faraday/retry"
require "json"

module ApiTestFramework
  class Client
    attr_reader :config, :token

    def initialize(config: Config.new, token: nil)
      @config = config
      @token = token
    end

    def with_token(token)
      self.class.new(config: config, token: token)
    end

    def get(path, params: {}, headers: {})
      request(:get, path, params: params, headers: headers)
    end

    def post(path, body: {}, headers: {})
      request(:post, path, body: body, headers: headers)
    end

    def put(path, body: {}, headers: {})
      request(:put, path, body: body, headers: headers)
    end

    def patch(path, body: {}, headers: {})
      request(:patch, path, body: body, headers: headers)
    end

    def delete(path, headers: {})
      request(:delete, path, headers: headers)
    end

    def alive?
      get("/up").success?
    rescue Faraday::Error
      false
    end

    private

    def request(method, path, params: {}, body: nil, headers: {})
      started = Process.clock_gettime(Process::CLOCK_MONOTONIC)
      faraday_response = connection.public_send(method, path) do |req|
        req.params.update(params) if params.any?
        req.body = JSON.generate(body) unless body.nil? || method == :get || method == :delete
        req.headers.update(headers)
      end
      elapsed_ms = ((Process.clock_gettime(Process::CLOCK_MONOTONIC) - started) * 1000).round(2)

      Response.new(
        status: faraday_response.status,
        headers: faraday_response.headers,
        body: faraday_response.body,
        elapsed_ms: elapsed_ms
      )
    end

    def connection
      @connection ||= Faraday.new(url: config.base_url) do |f|
        f.request :retry, max: 1, interval: 0.2, exceptions: [ Faraday::TimeoutError, Faraday::ConnectionFailed ]
        f.headers["Accept"] = "application/json"
        f.headers["Content-Type"] = "application/json"
        f.headers["Authorization"] = "Bearer #{token}" if token
        f.options.open_timeout = config.open_timeout
        f.options.timeout = config.timeout
        f.adapter Faraday.default_adapter
      end
    end
  end
end
