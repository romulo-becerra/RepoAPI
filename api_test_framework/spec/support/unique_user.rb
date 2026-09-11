# frozen_string_literal: true

module UniqueUser
  module_function

  def attributes(pin: "1234")
    suffix = "#{Time.now.to_i}#{SecureRandom.hex(3)}"
    {
      first_name: "Api",
      last_name: "Tester",
      email: "api.tester+#{suffix}@example.com",
      pin: pin
    }
  end
end
