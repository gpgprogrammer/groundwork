import { defineConfig } from "@playwright/test";

/**
 * Merit 2.0 preview suite: runs against an isolated server on port 3200 backed by the
 * local file store (.data/), so tests never touch production data or payments.
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  fullyParallel: false,
  workers: 1,
  use: { baseURL: "http://127.0.0.1:3200", trace: "retain-on-failure", storageState: "e2e/storage-3200.json" },
  webServer: {
    command: "npm run build && npm run start -- --hostname 127.0.0.1 --port 3200",
    url: "http://127.0.0.1:3200",
    reuseExistingServer: true,
    timeout: 300_000,
  },
});
