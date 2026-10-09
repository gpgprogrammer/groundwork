import { defineConfig } from "@playwright/test";

const BASE_URL = process.env.BASE_URL ?? "http://127.0.0.1:3000";

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  fullyParallel: false,
  workers: 1,
  // Test browsers start with the first-visit welcome popup already dismissed (one test checks the popup itself).
  // The origin follows BASE_URL, so the popup stays dismissed against any local server.
  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
    storageState: { cookies: [], origins: [{ origin: new URL(BASE_URL).origin, localStorage: [{ name: "merit:welcome-dismissed", value: "9999999999999" }] }] },
  },
  webServer: process.env.PW_USE_DEV
    ? {
        command: "npm run dev -- --port 3000",
        url: "http://127.0.0.1:3000",
        reuseExistingServer: true,
        timeout: 120_000,
      }
    : {
        command: "npm run build && npm run start -- --hostname 127.0.0.1 --port 3000",
        url: "http://127.0.0.1:3000",
        reuseExistingServer: !process.env.CI,
        timeout: 180_000,
      },
});
