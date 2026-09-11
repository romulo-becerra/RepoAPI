import { randomBytes } from "node:crypto";
import { config } from "../config";
import type { RegisterPayload } from "../schemas/auth";

export function uniqueUser(overrides: Partial<RegisterPayload> = {}): RegisterPayload {
  const suffix = `${Date.now()}${randomBytes(3).toString("hex")}`;

  return {
    first_name: "Api",
    last_name: "Tester",
    email: `api.tester+${suffix}@example.com`,
    pin: config.defaultPin,
    ...overrides,
  };
}
