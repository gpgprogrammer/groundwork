import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  fullyParallel: false,
  workers: 1,
  // Test browsers start with the first-visit welcome popup already dismissed (one test checks the popup itself).
  use: { baseURL: process.env.BASE_URL ?? "http://127.0.0.1:3000", trace: "retain-on-failure", storageState: "e2e/storage.json" },
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
