import { defineConfig } from "@playwright/test";
import dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["list"], ["html", { open: "never" }]],
  timeout: 30_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: process.env.API_BASE_URL ?? "http://localhost:3001",
    extraHTTPHeaders: {
      Accept: "application/json",
    },
    ignoreHTTPSErrors: true,
  },
  projects: [{ name: "api" }],
});
