import { test, expect } from "@playwright/test";
import { registerResponseSchema } from "../../src/schemas/auth";

test.describe("auth schemas", () => {
  test("accepts a valid register payload", () => {
    const parsed = registerResponseSchema.parse({
      message: "Usuario registrado exitosamente",
      token: "jwt-token",
      user: { id: 1, first_name: "Api", last_name: "Tester", email: "a@example.com", role: "customer" },
      account: { account_number: "123", balance: 1000, clabe: "000" },
    });

    expect(parsed.user.email).toBe("a@example.com");
  });

  test("rejects a register payload without token", () => {
    expect(() =>
      registerResponseSchema.parse({
        message: "ok",
        user: { id: 1, first_name: "Api", last_name: "Tester", email: "a@example.com" },
        account: { account_number: "123", balance: 1000 },
      }),
    ).toThrow();
  });
});
