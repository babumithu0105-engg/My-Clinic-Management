import { test, expect } from "@playwright/test";

// Auth tests run without storageState since we're testing login
test.describe("Authentication", () => {
  test("doctor login redirects to doctor dashboard", async ({ page }) => {
    await page.goto("/login");

    // Fill login form
    await page.fill('input[type="email"]', "doctor@clinic.local");
    await page.fill('input[type="password"]', "testpass123");

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for redirect and check URL
    await page.waitForURL("**/doctor");
    expect(page.url()).toContain("/doctor");
  });

  test("receptionist login redirects to receptionist dashboard", async ({
    page,
  }) => {
    await page.goto("/login");

    await page.fill('input[type="email"]', "receptionist@clinic.local");
    await page.fill('input[type="password"]', "testpass123");

    await page.click('button[type="submit"]');

    await page.waitForURL("**/receptionist");
    expect(page.url()).toContain("/receptionist");
  });

  test("admin login redirects to admin dashboard", async ({ page }) => {
    await page.goto("/login");

    await page.fill('input[type="email"]', "admin@clinic.local");
    await page.fill('input[type="password"]', "testpass123");

    await page.click('button[type="submit"]');

    await page.waitForURL("**/admin");
    expect(page.url()).toContain("/admin");
  });

  test("wrong password shows error toast", async ({ page }) => {
    await page.goto("/login");

    await page.fill('input[type="email"]', "doctor@clinic.local");
    await page.fill('input[type="password"]', "wrongpassword");

    await page.click('button[type="submit"]');

    // Wait for error toast
    const errorToast = page.locator("text=Login failed");
    await expect(errorToast).toBeVisible({ timeout: 5000 });
  });

  test("invalid email shows error toast", async ({ page }) => {
    await page.goto("/login");

    await page.fill('input[type="email"]', "nonexistent@clinic.local");
    await page.fill('input[type="password"]', "testpass123");

    await page.click('button[type="submit"]');

    // Wait for error toast
    const errorToast = page.locator("text=Login failed");
    await expect(errorToast).toBeVisible({ timeout: 5000 });
  });

  test("empty email prevents submit", async ({ page }) => {
    await page.goto("/login");

    // Only fill password
    await page.fill('input[type="password"]', "testpass123");

    // Button should be disabled or form should not submit
    const emailInput = page.locator('input[type="email"]');
    const isInvalid = await emailInput.evaluate((el: HTMLInputElement) =>
      el.checkValidity()
    );

    expect(isInvalid).toBe(false);
  });

  test("empty password prevents submit", async ({ page }) => {
    await page.goto("/login");

    // Only fill email
    await page.fill('input[type="email"]', "doctor@clinic.local");

    const passwordInput = page.locator('input[type="password"]');
    const isInvalid = await passwordInput.evaluate((el: HTMLInputElement) =>
      el.checkValidity()
    );

    expect(isInvalid).toBe(false);
  });

  test("login page displays welcome message", async ({ page }) => {
    await page.goto("/login");

    // Check for key page elements
    await expect(page.locator("text=Welcome Back")).toBeVisible();
    await expect(page.locator("text=Sign in to your account to continue")).toBeVisible();
  });
});
