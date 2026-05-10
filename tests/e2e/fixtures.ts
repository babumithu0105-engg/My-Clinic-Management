import { test as base, Page } from "@playwright/test";

type TestFixtures = {
  authedPage: Page;
};

export const test = base.extend<TestFixtures>({
  authedPage: async ({ page }, use) => {
    // Page is already authenticated via storageState in playwright.config.ts
    await use(page);
  },
});

export { expect } from "@playwright/test";
