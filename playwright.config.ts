import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  retries: 1,
  workers: 1,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "setup",
      testMatch: /global-setup\.ts/,
    },
    {
      name: "receptionist",
      use: { storageState: "tests/e2e/.auth/receptionist.json" },
      dependencies: ["setup"],
    },
    {
      name: "doctor",
      use: { storageState: "tests/e2e/.auth/doctor.json" },
      dependencies: ["setup"],
    },
    {
      name: "admin",
      use: { storageState: "tests/e2e/.auth/admin.json" },
      dependencies: ["setup"],
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 120 * 1000,
  },
});
