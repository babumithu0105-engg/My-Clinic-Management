import { test, expect } from "../fixtures";
import { format, addDays } from "date-fns";

test.describe("Receptionist - Appointments", () => {
  let patientId: string;
  let patientName: string;

  test.beforeEach(async ({ page }) => {
    // Create a test patient for appointments
    const response = await page.request.post("/api/patients", {
      data: {
        name: `TestPatient-${Date.now()}`,
        phone_number: `555${Math.floor(Math.random() * 9999999)
          .toString()
          .padStart(7, "0")}`,
        age: 30,
      },
    });

    if (response.ok()) {
      const data = await response.json();
      patientId = data.id;
      patientName = data.name;
    }

    // Navigate to receptionist page
    await page.goto("/receptionist");

    // Go to Schedule tab
    const scheduleTab = page.locator("text=Schedule");
    await scheduleTab.click();
  });

  test("should book an appointment", async ({ page }) => {
    // Click "Book Appointment" button
    const bookBtn = page.locator('button:has-text("Book Appointment")');
    if (await bookBtn.isVisible()) {
      await bookBtn.click();

      // Wait for booking form
      await expect(page.locator("text=Book Appointment")).toBeVisible();

      // Select patient (would need to implement patient search in form)
      const patientField = page.locator('input[placeholder*="Patient"]').first();
      if (await patientField.isVisible()) {
        await patientField.fill(patientName);
        await page.click(`text=${patientName}`);
      }

      // Select future date
      const tomorrow = addDays(new Date(), 1);
      const dateStr = format(tomorrow, "MMM dd, yyyy");

      const dateField = page.locator('button:has-text("Select a date")').first();
      await dateField.click();
      await page.click(`text=${dateStr}`);

      // Select duration
      const durationSelect = page.locator('select').first();
      await durationSelect.selectOption("30");

      // Select time slot
      const timeButtons = page.locator('button[class*="time"]');
      if ((await timeButtons.count()) > 0) {
        await timeButtons.first().click();
      }

      // Submit booking
      const bookSubmitBtn = page.locator('button:has-text("Confirm")');
      if (await bookSubmitBtn.isVisible()) {
        await bookSubmitBtn.click();
      }

      // Verify success
      const successToast = page.locator("text=successfully|scheduled");
      const visible = await successToast
        .isVisible({ timeout: 5000 })
        .catch(() => false);

      expect(visible).toBe(true);
    }
  });

  test("should cancel an appointment", async ({ page }) => {
    // Book an appointment first
    const bookBtn = page.locator('button:has-text("Book Appointment")');
    if (await bookBtn.isVisible()) {
      await bookBtn.click();
      await expect(page.locator("text=Book Appointment")).toBeVisible();

      // Fill booking form (simplified)
      const durationSelect = page.locator('select').first();
      await durationSelect.selectOption("30");

      const confirmBtn = page.locator('button:has-text("Confirm")');
      if (await confirmBtn.isVisible()) {
        await confirmBtn.click();
      }

      await page.waitForTimeout(1000);
    }

    // Now find and cancel an appointment
    const cancelBtn = page.locator('button:has-text("Cancel")').first();
    if (await cancelBtn.isVisible()) {
      await cancelBtn.click();

      // Confirm cancellation
      const confirmCancel = page.locator('button:has-text("Cancel")').last();
      await confirmCancel.click();

      // Verify success
      const successToast = page.locator("text=successfully|cancelled");
      const visible = await successToast
        .isVisible({ timeout: 5000 })
        .catch(() => false);

      expect(visible).toBe(true);
    }
  });

  test("should reschedule an appointment", async ({ page }) => {
    // Look for reschedule button
    const rescheduleBtn = page.locator('button:has-text("Reschedule")').first();

    if (await rescheduleBtn.isVisible()) {
      await rescheduleBtn.click();

      // Wait for reschedule form
      await expect(page.locator("text=Reschedule")).toBeVisible({
        timeout: 5000,
      });

      // Select new date
      const tomorrow = addDays(new Date(), 2);
      const dateStr = format(tomorrow, "MMM dd, yyyy");

      const dateField = page.locator('button:has-text("Select")').first();
      await dateField.click();
      await page.click(`text=${dateStr}`);

      // Confirm reschedule
      const confirmBtn = page.locator('button:has-text("Confirm")').last();
      await confirmBtn.click();

      // Verify success
      const successToast = page.locator("text=successfully|rescheduled");
      const visible = await successToast
        .isVisible({ timeout: 5000 })
        .catch(() => false);

      expect(visible).toBe(true);
    }
  });

  test("should display appointments in schedule", async ({ page }) => {
    // Check if schedule has appointments or empty state
    const appointments = page.locator('[class*="appointment"], [class*="slot"]');
    const emptyState = page.locator("text=No appointments|No upcoming");

    const hasContent =
      (await appointments.count()) > 0 ||
      (await emptyState.isVisible().catch(() => false));

    expect(hasContent).toBe(true);
  });
});
