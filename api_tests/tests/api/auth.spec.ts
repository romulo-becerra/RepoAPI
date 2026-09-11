import { uniqueUser } from "../../src/factories/user.factory";
import { test, expect } from "../../src/fixtures/api.fixture";
import { errorsResponseSchema, loginResponseSchema, registerResponseSchema } from "../../src/schemas/auth";

test.describe("Auth", () => {
  test("POST /api/v1/register creates a user and returns a JWT", async ({ api }) => {
    const payload = uniqueUser();
    const { status, body } = await api.http.json(await api.auth.register(payload));
    const parsed = registerResponseSchema.parse(body);

    expect(status).toBe(201);
    expect(parsed.user.email).toBe(payload.email);
    expect(parsed.token.length).toBeGreaterThan(10);
  });

  test("POST /api/v1/register rejects an incomplete payload", async ({ api }) => {
    const { status, body } = await api.http.json(
      await api.auth.register({ email: "incompleto@example.com" } as never),
    );

    expect(status).toBe(422);
    expect(errorsResponseSchema.parse(body).errors).toBeTruthy();
  });

  test("POST /api/v1/login authenticates with account number and pin", async ({ api, customer }) => {
    const { status, body } = await api.http.json(
      await api.auth.login(customer.register.account.account_number, customer.pin),
    );
    const parsed = loginResponseSchema.parse(body);

    expect(status).toBe(200);
    expect(parsed.message).toBe("Inicio de sesión exitoso");
  });

  test("POST /api/v1/login rejects an invalid pin", async ({ api, customer }) => {
    const { status, body } = await api.http.json(
      await api.auth.login(customer.register.account.account_number, "0000"),
    );

    expect(status).toBe(401);
    expect(errorsResponseSchema.parse(body).errors).toBe("Número de cuenta o PIN incorrecto");
  });

  test("POST /api/v1/logout requires a token", async ({ api }) => {
    const response = await api.auth.logout("");

    expect(response.status()).toBe(401);
  });

  test("POST /api/v1/logout closes a valid session", async ({ api, customer }) => {
    const { status, body } = await api.http.json<{ message: string }>(await api.auth.logout(customer.token));

    expect(status).toBe(200);
    expect(body.message).toBe("Sesión cerrada correctamente");
  });
});
