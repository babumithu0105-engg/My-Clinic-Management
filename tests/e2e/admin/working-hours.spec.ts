import { test, expect } from "../fixtures";

test.describe("Admin - Working Hours", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to working hours page
    await page.goto("/admin/working-hours");
  });

  test("should display working hours page", async ({ page }) => {
    await expect(page.locator("text=Working Hours|hours")).toBeVisible();
  });

  test("should display 7 days of the week", async ({ page }) => {
    // Check for day labels (Monday, Tuesday, etc.) or day inputs
    const dayElements = page.locator(
      "text=Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday"
    );
    const dayCount = await dayElements.count();

    // Should have at least 7 references to days
    expect(dayCount).toBeGreaterThanOrEqual(7);
  });

  test("should toggle a day to closed", async ({ page }) => {
    // Find a toggle or checkbox for a day
    const toggles = page.locator('input[type="checkbox"]');
    const toggleCount = await toggles.count();

    if (toggleCount > 0) {
      const firstToggle = toggles.first();
      const initialState = await firstToggle.isChecked();

      // Toggle it
      await firstToggle.click();

      const newState = await firstToggle.isChecked();
      expect(newState).not.toBe(initialState);

      // Save
      const saveBtn = page.locator('button:has-text("Save")').first();
      if (await saveBtn.isVisible()) {
        await saveBtn.click();

        const successToast = page.locator("text=successfully|updated");
        const visible = await successToast
          .isVisible({ timeout: 5000 })
          .catch(() => false);

        expect(visible).toBe(true);
      }

      // Reload and verify
      await page.reload();
      const reloadedToggle = toggles.first();
      const reloadedState = await reloadedToggle.isChecked();

      expect(reloadedState).toBe(newState);
    }
  });

  test("should update start time for a day", async ({ page }) => {
    // Find time inputs (look for HH:MM pattern)
    const timeInputs = page.locator('input[type="time"]');
    const timeCount = await timeInputs.count();

    if (timeCount > 0) {
      const firstTimeInput = timeInputs.first();
      await firstTimeInput.fill("08:30");

      // Save
      const saveBtn = page.locator('button:has-text("Save")').first();
      if (await saveBtn.isVisible()) {
        await saveBtn.click();

        const successToast = page.locator("text=successfully|updated");
        const visible = await successToast
          .isVisible({ timeout: 5000 })
          .catch(() => false);

        expect(visible).toBe(true);
      }

      // Reload and verify
      await page.reload();
      const reloadedInput = timeInputs.first();
      const value = await reloadedInput.inputValue();

      expect(value).toBe("08:30");
    }
  });

  test("should update end time for a day", async ({ page }) => {
    // Find time inputs and use the second one (end time)
    const timeInputs = page.locator('input[type="time"]');
    const timeCount = await timeInputs.count();

    if (timeCount >= 2) {
      const endTimeInput = timeInputs.nth(1);
      await endTimeInput.fill("18:00");

      // Save
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
