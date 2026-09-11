# Playwright API tests

Black-box HTTP tests for RepoAPI using **TypeScript + Playwright Test**. No browser is launched: tests use `APIRequestContext`.

## Architecture

```
config → HttpClient → domain clients → fixtures → tests
                              ↘ Zod schemas (contracts)
```

| Layer | Role |
| --- | --- |
| `src/http` | HTTP wrapper (`json`, headers, verbs) |
| `src/clients` | One class per API domain (`AuthClient`, `AccountsClient`) |
| `src/schemas` | Response contracts with Zod |
| `src/fixtures` | Playwright fixtures: `api`, `customer` |
| `tests/api` | Live API tests |
| `tests/unit` | Schema tests (no server) |

## Setup

```bash
cd api_tests
npm install
# API-only: browsers are not required
# PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm install
cp .env.example .env
```

Start RepoAPI:

```bash
bin/rails s -p 3001
```

Run tests:

```bash
npm test
npm run test:api
npm run test:unit
```

If the API is down and you want skips instead of failures:

```bash
API_SKIP_IF_DOWN=1 npm test
```

## Adding a test

1. Add or extend a client in `src/clients`.
2. Describe the JSON contract in `src/schemas`.
3. Use `api` / `customer` fixtures in `tests/api`.

```ts
import { test, expect } from "../../src/fixtures/api.fixture";

test("example", async ({ api, customer }) => {
  const response = await api.accounts.list(customer.token);
  expect(response.status()).toBe(200);
});
```
