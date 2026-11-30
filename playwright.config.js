import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright E2E & Smoke Testing Configuration
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 30000,
  expect: {
    timeout: 7000
  },
  fullyParallel: false,
  reporter: [["list"]],
  use: {
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || "http://localhost:5173",
    trace: "on-first-retry",
    headless: true
  },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:5173",
    reuseExistingServer: true,
    timeout: 120000
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] }
    }
  ]
});
