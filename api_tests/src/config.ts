export const config = {
  baseUrl: process.env.API_BASE_URL ?? "http://localhost:3001",
  skipIfDown: process.env.API_SKIP_IF_DOWN === "1",
  defaultPin: "1234",
} as const;
