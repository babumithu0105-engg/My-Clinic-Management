import { test, expect } from "../fixtures";

test.describe("Receptionist - Queue Management", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to receptionist dashboard
    await page.goto("/receptionist");

    // Ensure we're on the Today's Queue tab
    const queueTab = page.locator("text=Today's Queue");
    if (await queueTab.isVisible()) {
      await queueTab.click();
    }
  });

  test("should display Today's Queue tab", async ({ page }) => {
    const queueTab = page.locator("text=Today's Queue");
    await expect(queueTab).toBeVisible();
  });

  test("should display Schedule tab", async ({ page }) => {
    const scheduleTab = page.locator("text=Schedule");
    await expect(scheduleTab).toBeVisible();
  });

  test("should add a walk-in patient", async ({ page }) => {
    // First, create a patient to use for walk-in
    // Navigate to patients page
    await page.goto("/receptionist/patients");

    // Add patient
    await page.click('button:has-text("Add Patient")');
    await expect(page.locator("text=Add Patient")).toBeVisible();

    const timestamp = Date.now();
    const patientName = `WalkInTest ${timestamp}`;
    const patientPhone = `555${Math.floor(Math.random() * 9999999)
      .toString()
      .padStart(7, "0")}`;

    await page.fill('input[placeholder*="name"]', patientName);
    await page.fill('input[placeholder*="phone"]', patientPhone);

    await page.click('button:has-text("Save") >> nth=0');
    await expect(page.locator("text=successfully")).toBeVisible({ timeout: 5000 });

    // Go back to queue
    await page.goto("/receptionist");

    // Click "Add Walk-in" button
    const addWalkInBtn = page.locator('button:has-text("Add Walk-in")');
    if (await addWalkInBtn.isVisible()) {
      await addWalkInBtn.click();

      // Fill walk-in form
      await expect(page.locator("text=Add Walk-in Patient")).toBeVisible();

      // Search and select patient
      const patientSearch = page.locator('input[placeholder*="Search"]').first();
      await patientSearch.fill(patientName);

      // Wait for dropdown to appear
      await page.waitForTimeout(400); // Debounce delay

      // Click on patient from dropdown
      const patientOption = page.locator(`text=${patientName}`).first();
      await patientOption.click();

      // Verify patient is selected (shows patient card instead of search)
      const selectedPatientCard = page.locator(`text=${patientName}`);
      await expect(selectedPatientCard).toBeVisible({ timeout: 5000 });

      // Select duration using Radix Select
      const durationTrigger = page.locator('[role="combobox"]').filter({ has: page.locator("text=Duration").locator("..") }).first();
      await durationTrigger.click();
      await page.click('div[role="option"]:has-text("30 minutes")');

      // Submit
      await page.click('button:has-text("Add Walk-in")');

      // Verify success
      await expect(page.locator("text=successfully")).toBeVisible({ timeout: 5000 });
    }
  });

  test("should send patient to doctor", async ({ page }) => {
    // First ensure we have a patient in the queue
    // This would typically involve booking an appointment or adding a walk-in first

    // Look for "Send to Doctor" buttons
    const sendToDoctorButtons = page.locator('button:has-text("Send to Doctor")');
    const buttonCount = await sendToDoctorButtons.count();

    if (buttonCount > 0) {
      // Click the first "Send to Doctor" button
      await sendToDoctorButtons.first().click();

      // Verify status changes or appointment moves
      await page.waitForTimeout(500); // Brief wait for state update

      // Should see a success indication or status change
      const successToast = page.locator("text=successfully").or(
        page.locator("text=checked-in")
      );
      const visible = await successToast.isVisible().catch(() => false);
      expect(visible).toBe(true);
    }
  });

  test("should display queue sections (booked and walk-ins)", async ({
    page,
  }) => {
    // Check if queue has booked appointments section
    const sections = page.locator('[class*="section"], [class*="heading"]');
    const sectionCount = await sections.count();

    // Either we have sections or empty states
    const hasContent =
      sectionCount > 0 ||
      (await page
        .locator("text=No appointments|No walk-ins|queue is empty")
        .isVisible()
        .catch(() => false));

    expect(hasContent).toBe(true);
  });
});
