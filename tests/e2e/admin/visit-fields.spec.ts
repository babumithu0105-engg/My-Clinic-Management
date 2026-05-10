import { test, expect } from "../fixtures";

test.describe("Admin - Visit Fields Configuration", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to visit fields page
    await page.goto("/admin/visit-fields");
  });

  test("should display visit fields page", async ({ page }) => {
    await expect(page.locator("text=Visit|Field|Documentation")).toBeVisible();
  });

  test("should add a text field", async ({ page }) => {
    const addBtn = page.locator('button:has-text("Add Field")').first();

    if (await addBtn.isVisible()) {
      await addBtn.click();

      await expect(page.locator("text=Add Field")).toBeVisible({ timeout: 5000 });

      // Fill field name
      const nameInput = page.locator('input[placeholder*="name"]').first();
      if (await nameInput.isVisible()) {
        await nameInput.fill("Symptoms");
      }

      // Select type (text should be default)
      const typeSelect = page.locator('select').first();
      if (await typeSelect.isVisible()) {
        await typeSelect.selectOption("text");
      }

      // Save
      const saveBtn = page.locator('button:has-text("Add") >> nth=0').first();
      if (await saveBtn.isVisible()) {
        await saveBtn.click();

        // Verify success
        const successToast = page.locator("text=successfully|added");
        const visible = await successToast
          .isVisible({ timeout: 5000 })
          .catch(() => false);

        expect(visible).toBe(true);

        // Verify in list
        const fieldInList = page.locator(`text=Symptoms`);
        await expect(fieldInList).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test("should add a dropdown field with options", async ({ page }) => {
    const addBtn = page.locator('button:has-text("Add Field")').first();

    if (await addBtn.isVisible()) {
      await addBtn.click();

      await expect(page.locator("text=Add Field")).toBeVisible({ timeout: 5000 });

      // Fill field name
      const nameInput = page.locator('input[placeholder*="name"]').first();
      if (await nameInput.isVisible()) {
        await nameInput.fill("Severity");
      }

      // Select dropdown type
      const typeSelect = page.locator('select').first();
      if (await typeSelect.isVisible()) {
        await typeSelect.selectOption("dropdown");
      }

      // Wait for options field to appear
      await page.waitForTimeout(200);

      // Fill dropdown options
      const optionsField = page.locator('textarea').first();
      if (await optionsField.isVisible()) {
        await optionsField.fill("Mild, Moderate, Severe");
      }

      // Save
      const saveBtn = page.locator('button:has-text("Add") >> nth=0').first();
      if (await saveBtn.isVisible()) {
        await saveBtn.click();

        const successToast = page.locator("text=successfully|added");
        const visible = await successToast
          .isVisible({ timeout: 5000 })
          .catch(() => false);

        expect(visible).toBe(true);

        const fieldInList = page.locator(`text=Severity`);
        await expect(fieldInList).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test("should mark field as required", async ({ page }) => {
    const addBtn = page.locator('button:has-text("Add Field")').first();

    if (await addBtn.isVisible()) {
      await addBtn.click();

      await expect(page.locator("text=Add Field")).toBeVisible({ timeout: 5000 });

      const nameInput = page.locator('input[placeholder*="name"]').first();
      if (await nameInput.isVisible()) {
        await nameInput.fill("Diagnosis");
      }

      // Check "Required" checkbox
      const requiredCheckbox = page.locator('input[type="checkbox"]').first();
      if (await requiredCheckbox.isVisible()) {
        const isChecked = await requiredCheckbox.isChecked();
        if (!isChecked) {
          await requiredCheckbox.click();
        }
      }

      // Save
      const saveBtn = page.locator('button:has-text("Add") >> nth=0').first();
      if (await saveBtn.isVisible()) {
        await saveBtn.click();

        const successToast = page.locator("text=successfully|added");
        const visible = await successToast
          .isVisible({ timeout: 5000 })
          .catch(() => false);

        expect(visible).toBe(true);

        // Verify "Required" badge appears
        const requiredBadge = page.locator(
          `text=Diagnosis`,
          { has: page.locator('text="Required"') }
        );
        await expect(requiredBadge).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test("should edit a field", async ({ page }) => {
    // Add a field first
    const addBtn = page.locator('button:has-text("Add Field")').first();
    if (await addBtn.isVisible()) {
      await addBtn.click();

      const nameInput = page.locator('input[placeholder*="name"]').first();
      if (await nameInput.isVisible()) {
        await nameInput.fill("Original Name");
      }

      const saveBtn = page.locator('button:has-text("Add") >> nth=0').first();
      if (await saveBtn.isVisible()) {
        await saveBtn.click();
        await page.waitForTimeout(500);
      }
    }

    // Now edit it
    const editBtn = page.locator('button[title="Edit"]').first();
    if (await editBtn.isVisible()) {
      await editBtn.click();

      await expect(page.locator("text=Edit Field")).toBeVisible({
        timeout: 5000,
      });

      const nameInput = page.locator('input[placeholder*="name"]').first();
      if (await nameInput.isVisible()) {
        await nameInput.clear();
        await nameInput.fill("Updated Name");
      }

      const saveBtn = page.locator('button:has-text("Update")').first();
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

  test("should reorder fields with move down", async ({ page }) => {
    // Check if move down button exists
    const moveDownBtn = page.locator('button[title="Move down"]').first();

    if (await moveDownBtn.isVisible()) {
      const isDisabled = await moveDownBtn.isDisabled();

      if (!isDisabled) {
        // Click move down
        await moveDownBtn.click();

        // Verify action
        const successToast = page.locator("text=successfully|moved");
        const visible = await successToast
          .isVisible({ timeout: 5000 })
          .catch(() => false);

        expect(visible).toBe(true);
      }
    }
  });

  test("should delete a field", async ({ page }) => {
    // Add a field to delete
    const addBtn = page.locator('button:has-text("Add Field")').first();
    if (await addBtn.isVisible()) {
      await addBtn.click();

      const nameInput = page.locator('input[placeholder*="name"]').first();
      if (await nameInput.isVisible()) {
        await nameInput.fill("Delete Me");
      }

      const saveBtn = page.locator('button:has-text("Add") >> nth=0').first();
      if (await saveBtn.isVisible()) {
        await saveBtn.click();
        await page.waitForTimeout(500);
      }
    }

    // Delete the field
    const deleteBtn = page.locator('button[title="Delete"]').first();
    if (await deleteBtn.isVisible()) {
      await deleteBtn.click();

      // Confirm deletion
      const confirmBtn = page.locator('button:has-text("Delete")').last();
      if (await confirmBtn.isVisible()) {
        await confirmBtn.click();

        const successToast = page.locator("text=successfully|deleted");
        const visible = await successToast
          .isVisible({ timeout: 5000 })
          .catch(() => false);

        expect(visible).toBe(true);
      }
    }
  });
});
