# frozen_string_literal: true

RSpec::Matchers.define :have_http_status do |expected|
  match do |response|
    response.status == expected
  end

  failure_message do |response|
    "expected HTTP #{expected}, got #{response.status}: #{response.raw_body.byteslice(0, 300)}"
  end
end

RSpec::Matchers.define :have_json_keys do |*keys|
  match do |response|
    hash = response.json
    hash.is_a?(Hash) && keys.map(&:to_s).all? { |key| hash.key?(key) }
  end

  failure_message do |response|
    "expected JSON keys #{keys.inspect}, got #{response.json.inspect}"
  end
end
