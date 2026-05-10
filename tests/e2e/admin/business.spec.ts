import { test, expect } from "../fixtures";

test.describe("Admin - Business Configuration", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to business settings
    await page.goto("/admin/business");
  });

  test("should display business page", async ({ page }) => {
    await expect(page.locator("text=Business|clinic")).toBeVisible();
  });

  test("should load existing business info", async ({ page }) => {
    // Check if any business fields are visible and populated
    const inputs = page.locator('input[type="text"]');
    const inputCount = await inputs.count();

    // Should have at least name field
    expect(inputCount).toBeGreaterThan(0);
  });

  test("should update business name", async ({ page }) => {
    // Find the name input field
    const nameInput = page.locator('input[placeholder*="name"]').first();

    if (await nameInput.isVisible()) {
      // Clear and update name
      const timestamp = Date.now();
      const newName = `Updated Clinic ${timestamp}`;

      await nameInput.clear();
      await nameInput.fill(newName);

      // Save
      const saveBtn = page.locator('button:has-text("Save")').first();
      if (await saveBtn.isVisible()) {
        await saveBtn.click();

        // Verify success
        const successToast = page.locator("text=successfully|updated");
        const visible = await successToast
          .isVisible({ timeout: 5000 })
          .catch(() => false);

        expect(visible).toBe(true);
      }

      // Reload and verify persistence
      await page.reload();
      const reloadedInput = page.locator('input[placeholder*="name"]').first();
      const reloadedValue = await reloadedInput.inputValue();

      expect(reloadedValue).toBe(newName);
    }
  });

  test("should update clinic phone", async ({ page }) => {
    const phoneInput = page.locator('input[placeholder*="phone"]').first();

    if (await phoneInput.isVisible()) {
      const newPhone = "+1-555-0123";

      await phoneInput.clear();
      await phoneInput.fill(newPhone);

      const saveBtn = page.locator('button:has-text("Save")').first();
      if (await saveBtn.isVisible()) {
        await saveBtn.click();

        const successToast = page.locator("text=successfully|updated");
        const visible = await successToast
          .isVisible({ timeout: 5000 })
          .catch(() => false);

        expect(visible).toBe(true);
      }
    }
  });

  test("should update clinic email", async ({ page }) => {
    const emailInput = page.locator('input[type="email"]').first();

    if (await emailInput.isVisible()) {
      const newEmail = `clinic-${Date.now()}@example.com`;

      await emailInput.clear();
      await emailInput.fill(newEmail);

      const saveBtn = page.locator('button:has-text("Save")').first();
      if (await saveBtn.isVisible()) {
        await saveBtn.click();

        const successToast = page.locator("text=successfully|updated");
        const visible = await successToast
          .isVisible({ timeout: 5000 })
          .catch(() => false);

        expect(visible).toBe(true);
      }
    }
  });

  test("should update clinic address", async ({ page }) => {
    const addressInput = page.locator('input[placeholder*="address"]').first();

    if (await addressInput.isVisible()) {
      const newAddress = "456 Oak Avenue, Suite 200";

      await addressInput.clear();
      await addressInput.fill(newAddress);

      const saveBtn = page.locator('button:has-text("Save")').first();
      if (await saveBtn.isVisible()) {
        await saveBtn.click();

        const successToast = page.locator("text=successfully|updated");
        const visible = await successToast
          .isVisible({ timeout: 5000 })
          .catch(() => false);

        expect(visible).toBe(true);
      }
    }
  });
});
