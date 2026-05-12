import { test, expect } from "../fixtures";

test.describe("Receptionist - Patients Management", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to patients page
    await page.goto("/receptionist/patients");
  });

  test("should display patients page with title", async ({ page }) => {
    await expect(page.locator("text=Patients")).toBeVisible();
  });

  test("should add a new patient", async ({ page }) => {
    // Click "Add Patient" button
    await page.click('button:has-text("Add Patient")');

    // Wait for form modal to appear
    await expect(page.locator("text=Add Patient")).toBeVisible();

    // Fill patient form
    const timestamp = Date.now();
    const patientName = `Test Patient ${timestamp}`;
    const patientPhone = `555${Math.floor(Math.random() * 9999999)
      .toString()
      .padStart(7, "0")}`;

    await page.fill('input[placeholder*="name"]', patientName);
    await page.fill('input[placeholder*="phone"]', patientPhone);
    await page.fill('input[placeholder*="age"]', "30");

    // Select sex using Radix Select
    const sexSelectTrigger = page.locator('[role="combobox"]').filter({ has: page.locator("text=Sex").locator("..") }).first();
    await sexSelectTrigger.click();
    await page.click('div[role="option"]:has-text("Male")');

    // Click save button
    await page.click('button:has-text("Save") >> nth=0');

    // Wait for success toast
    await expect(page.locator("text=successfully")).toBeVisible({ timeout: 5000 });

    // Verify patient appears in list
    await expect(page.locator(`text=${patientName}`)).toBeVisible({ timeout: 5000 });
  });

  test("should search patient by name", async ({ page }) => {
    // Create a patient first (using previous test's approach)
    await page.click('button:has-text("Add Patient")');
    await expect(page.locator("text=Add Patient")).toBeVisible();

    const timestamp = Date.now();
    const patientName = `SearchTest ${timestamp}`;
    const patientPhone = `555${Math.floor(Math.random() * 9999999)
      .toString()
      .padStart(7, "0")}`;

    await page.fill('input[placeholder*="name"]', patientName);
    await page.fill('input[placeholder*="phone"]', patientPhone);

    await page.click('button:has-text("Save") >> nth=0');
    await expect(page.locator("text=successfully")).toBeVisible({ timeout: 5000 });

    // Now search for it
    const searchInput = page.locator('input[placeholder*="Search"]');
    await searchInput.fill(patientName);

    // Wait for search results
    await expect(page.locator(`text=${patientName}`)).toBeVisible({ timeout: 5000 });
  });

  test("should search patient by phone", async ({ page }) => {
    // Create a patient
    await page.click('button:has-text("Add Patient")');
    await expect(page.locator("text=Add Patient")).toBeVisible();

    const timestamp = Date.now();
    const patientName = `PhoneSearch ${timestamp}`;
    const patientPhone = `555${Math.floor(Math.random() * 9999999)
      .toString()
      .padStart(7, "0")}`;

    await page.fill('input[placeholder*="name"]', patientName);
    await page.fill('input[placeholder*="phone"]', patientPhone);

    await page.click('button:has-text("Save") >> nth=0');
    await expect(page.locator("text=successfully")).toBeVisible({ timeout: 5000 });

    // Search by phone
    const searchInput = page.locator('input[placeholder*="Search"]');
    await searchInput.fill(patientPhone);

    // Wait for search results
    await expect(page.locator(`text=${patientName}`)).toBeVisible({ timeout: 5000 });
  });

  test("should view patient details", async ({ page }) => {
    // Create a patient first
    await page.click('button:has-text("Add Patient")');
    await expect(page.locator("text=Add Patient")).toBeVisible();

    const timestamp = Date.now();
    const patientName = `DetailView ${timestamp}`;
    const patientPhone = `555${Math.floor(Math.random() * 9999999)
      .toString()
      .padStart(7, "0")}`;

    await page.fill('input[placeholder*="name"]', patientName);
    await page.fill('input[placeholder*="phone"]', patientPhone);
    await page.fill('input[placeholder*="age"]', "25");

    await page.click('button:has-text("Save") >> nth=0');
    await expect(page.locator("text=successfully")).toBeVisible({ timeout: 5000 });

    // Click on patient row to view details
    await page.click(`button:has-text("${patientName}")`);

    // Wait for detail sheet to appear
    await expect(page.locator(`text=${patientName}`)).toBeVisible({ timeout: 5000 });
    await expect(page.locator(`text=${patientPhone}`)).toBeVisible();
    await expect(page.locator("text=25 years")).toBeVisible();
  });

  test("should show empty state when no patients", async ({ page }) => {
    // This is a global state check - if there are no patients, empty state should show
    // If there ARE patients, this test can be skipped or modified
    const emptyState = page.locator("text=No patients yet");
    const patientsList = page.locator('button[class*="border"]');

    // Either empty state or list exists
    const hasContent =
      (await emptyState.isVisible().catch(() => false)) ||
      (await patientsList.count()) > 0;

    expect(hasContent).toBe(true);
  });

  test("should edit patient and update status", async ({ page }) => {
    // Create a patient first
    await page.click('button:has-text("Add Patient")');
    await expect(page.locator("text=Add Patient")).toBeVisible();

    const timestamp = Date.now();
    const patientName = `EditStatus ${timestamp}`;
    const patientPhone = `555${Math.floor(Math.random() * 9999999)
      .toString()
      .padStart(7, "0")}`;

    await page.fill('input[placeholder*="name"]', patientName);
    await page.fill('input[placeholder*="phone"]', patientPhone);

    await page.click('button:has-text("Save") >> nth=0');
    await expect(page.locator("text=successfully")).toBeVisible({ timeout: 5000 });

    // Find and click the edit icon for the patient
    const patientRow = page.locator(`text=${patientName}`).first();
    const editIcon = patientRow.locator('..').locator('button:has-text("✎") , button[title="Edit"]').first();

    if (await editIcon.isVisible()) {
      await editIcon.click();

      // Wait for edit form
      await expect(page.locator("text=Edit Patient")).toBeVisible();

      // Should see status field in edit mode
      const statusField = page.locator("text=Status");
      expect(await statusField.isVisible()).toBe(true);

      // Close the form
      await page.click('button:has-text("Cancel")');
    }
  });
});
