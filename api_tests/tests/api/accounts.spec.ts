import { test, expect } from "../../src/fixtures/api.fixture";
import { balanceResponseSchema } from "../../src/schemas/accounts";

test.describe("Accounts", () => {
  test("lists accounts for the authenticated user", async ({ api, customer }) => {
    const response = await api.accounts.list(customer.token);

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body)).toBeTruthy();
  });

  test("rejects listing accounts without a token", async ({ api }) => {
    const response = await api.http.get("/api/v1/accounts");

    expect(response.status()).toBe(401);
  });

  test("returns the account balance", async ({ api, customer }: { api: any; customer: any }) => {
    const accountId = customer.login.account.id;
    const { status, body } = await api.http.json(await api.accounts.balance(customer.token, accountId));
    const parsed = balanceResponseSchema.parse(body);

    expect(status).toBe(200);
    expect(parsed.account_id).toBe(accountId);
  });
});
