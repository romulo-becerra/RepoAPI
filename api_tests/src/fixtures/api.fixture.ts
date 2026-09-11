import { test as base, expect, type APIRequestContext, type TestInfo } from "@playwright/test";
import { AccountsClient } from "../clients/accounts.client";
import { AuthClient } from "../clients/auth.client";
import { SystemClient } from "../clients/system.client";
import { config } from "../config";
import { uniqueUser } from "../factories/user.factory";
import { HttpClient } from "../http/http-client";
import {
  loginResponseSchema,
  registerResponseSchema,
  type LoginResponse,
  type RegisterResponse,
} from "../schemas/auth";

export type ApiClients = {
  http: HttpClient;
  auth: AuthClient;
  accounts: AccountsClient;
  system: SystemClient;
};

export type CustomerSession = {
  token: string;
  pin: string;
  register: RegisterResponse;
  login: LoginResponse;
};

type Fixtures = {
  http: HttpClient;
  api: ApiClients;
  customer: CustomerSession;
};

async function ensureApiIsUp(request: APIRequestContext, testInfo: TestInfo) {
  const health = await request.get("/up");
  if (health.ok()) return;

  const message = `API no disponible en ${config.baseUrl}. Arranca RepoAPI (bin/rails s -p 3001).`;
  if (config.skipIfDown) {
    testInfo.skip(true, message);
    return;
  }

  throw new Error(message);
}

export const test = base.extend<Fixtures>({
  http: async ({ request }, use, testInfo) => {
    await ensureApiIsUp(request, testInfo);
    await use(new HttpClient(request));
  },

  api: async ({ http }, use) => {
    await use({
      http,
      auth: new AuthClient(http),
      accounts: new AccountsClient(http),
      system: new SystemClient(http),
    });
  },

  customer: async ({ api }, use) => {
    const payload = uniqueUser();
    const registered = await api.http.json<RegisterResponse>(await api.auth.register(payload));
    expect(registered.status).toBe(201);
    const registerBody = registerResponseSchema.parse(registered.body);

    const loggedIn = await api.http.json<LoginResponse>(
      await api.auth.login(registerBody.account.account_number, payload.pin),
    );
    expect(loggedIn.status).toBe(200);
    const loginBody = loginResponseSchema.parse(loggedIn.body);

    await use({
      token: loginBody.token,
      pin: payload.pin,
      register: registerBody,
      login: loginBody,
    });
  },
});

export { expect } from "@playwright/test";
