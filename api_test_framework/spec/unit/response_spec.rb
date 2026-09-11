# frozen_string_literal: true

RSpec.describe ApiTestFramework::Response do
  it "parses JSON and exposes keys" do
    response = described_class.new(
      status: 201,
      headers: {},
      body: '{"token":"abc","user":{"id":1}}',
      elapsed_ms: 12.3
    )

    expect(response).to be_success
    expect(response["token"]).to eq("abc")
    expect(response.json["user"]["id"]).to eq(1)
  end

  it "raises when the body is not JSON" do
    response = described_class.new(status: 200, headers: {}, body: "<html>", elapsed_ms: 1)

    expect { response.json }.to raise_error(ApiTestFramework::Error, /not valid JSON/)
  end
end
