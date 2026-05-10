import { test, expect } from "../fixtures";
import { format, addDays } from "date-fns";

test.describe("Admin - Holidays", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to holidays page
    await page.goto("/admin/holidays");
  });

  test("should display holidays page", async ({ page }) => {
    await expect(page.locator("text=Holiday|Holidays")).toBeVisible();
  });

  test("should add a new holiday", async ({ page }) => {
    // Click "Add Holiday" button
    const addBtn = page.locator('button:has-text("Add Holiday")').first();

    if (await addBtn.isVisible()) {
      await addBtn.click();

      // Wait for form
      await expect(page.locator("text=Add Holiday|New Holiday")).toBeVisible({
        timeout: 5000,
      });

      // Select date
      const futureDate = addDays(new Date(), 7);
      const dateStr = format(futureDate, "MMM dd, yyyy");

      const dateField = page.locator('button:has-text("Select a date")').first();
      if (await dateField.isVisible()) {
        await dateField.click();
        await page.click(`text=${dateStr}`);
      }

      // Fill reason
      const reasonInput = page.locator('input[placeholder*="reason"]').first();
      if (await reasonInput.isVisible()) {
        await reasonInput.fill("Company Holiday");
      }

      // Save
      const saveBtn = page.locator('button:has-text("Save")').first();
      if (await saveBtn.isVisible()) {
        await saveBtn.click();

        // Verify success
        const successToast = page.locator("text=successfully|added");
        const visible = await successToast
          .isVisible({ timeout: 5000 })
          .catch(() => false);

        expect(visible).toBe(true);

        // Verify in list
        const holidayInList = page.locator(`text=Company Holiday`);
        await expect(holidayInList).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test("should delete a holiday", async ({ page }) => {
    // First add a holiday
    const addBtn = page.locator('button:has-text("Add Holiday")').first();

    if (await addBtn.isVisible()) {
      await addBtn.click();

      await expect(page.locator("text=Add Holiday|New Holiday")).toBeVisible({
        timeout: 5000,
      });

      const futureDate = addDays(new Date(), 14);
      const dateStr = format(futureDate, "MMM dd, yyyy");

      const dateField = page.locator('button:has-text("Select a date")').first();
      if (await dateField.isVisible()) {
        await dateField.click();
        await page.click(`text=${dateStr}`);
      }

      const reasonInput = page.locator('input[placeholder*="reason"]').first();
      if (await reasonInput.isVisible()) {
        await reasonInput.fill("Temporary Closure");
      }

      const saveBtn = page.locator('button:has-text("Save")').first();
      if (await saveBtn.isVisible()) {
        await saveBtn.click();

        await page.waitForTimeout(500);
      }
    }

    // Now delete the added holiday
    const deleteBtn = page.locator('button:has-text("Delete")').first();
    if (await deleteBtn.isVisible()) {
      await deleteBtn.click();

      // Confirm deletion
      const confirmBtn = page.locator('button:has-text("Delete")').last();
      if (await confirmBtn.isVisible()) {
        await confirmBtn.click();

        // Verify success
        const successToast = page.locator("text=successfully|deleted");
        const visible = await successToast
          .isVisible({ timeout: 5000 })
          .catch(() => false);

        expect(visible).toBe(true);
      }
    }
  });

  test("should display holidays in list", async ({ page }) => {
    // Check if holidays list exists
    const holidays = page.locator('[class*="holiday"], [class*="list"] >> text=/\\d{4}-\\d{2}-\\d{2}/');
    const listItems = page.locator('div, li, button').filter({
      hasText: /\d{4}-\d{2}-\d{2}/,
    });

    const hasContent =
      (await holidays.count()) > 0 ||
      (await listItems.count()) > 0 ||
      (await page
        .locator("text=No holidays|empty")
        .isVisible()
        .catch(() => false));

    expect(hasContent).toBe(true);
  });
});
