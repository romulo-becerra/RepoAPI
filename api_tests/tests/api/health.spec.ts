import { test, expect } from "../../src/fixtures/api.fixture";

test.describe("Health", () => {
  test("GET /up returns success", async ({ api }) => {
    const response = await api.system.health();

    expect(response.status()).toBe(200);
    expect(response.ok()).toBeTruthy();
  });

  test("GET / reports the API is running", async ({ api }) => {
    const { status, body } = await api.http.json<{ status: string; service: string; message: string }>(
      await api.system.root(),
    );

    expect(status).toBe(200);
    expect(body.status).toBe("ok");
    expect(body.service).toBe("bankfacilito");
  });
});
