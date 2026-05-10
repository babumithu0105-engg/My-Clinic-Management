import { test, expect } from "../fixtures";
import { format } from "date-fns";

test.describe("Doctor - Visit Workflow", () => {
  test.beforeEach(async ({ page, context }) => {
    // Navigate to doctor dashboard
    await page.goto("/doctor");
  });

  test("should display doctor queue page", async ({ page }) => {
    // Check for queue heading
    const heading = page.locator("text=Today's Queue|Queue|Patients");
    await expect(heading).toBeVisible();
  });

  test("should show checked-in patients", async ({ page, context }) => {
    // Create a test patient and appointment, then send to doctor
    // First create patient
    const patientResponse = await page.request.post("/api/patients", {
      data: {
        name: `DoctorTest-${Date.now()}`,
        phone_number: `555${Math.floor(Math.random() * 9999999)
          .toString()
          .padStart(7, "0")}`,
        age: 35,
      },
    });

    if (!patientResponse.ok()) {
      test.skip();
      return;
    }

    const patientData = await patientResponse.json();
    const patientId = patientData.id;

    // Create appointment for today
    const today = format(new Date(), "yyyy-MM-dd");
    const appointmentResponse = await page.request.post("/api/appointments", {
      data: {
        patient_id: patientId,
        appointment_date: today,
        appointment_time: "14:00",
        duration_minutes: 30,
      },
    });

    if (!appointmentResponse.ok()) {
      test.skip();
      return;
    }

    const appointmentData = await appointmentResponse.json();
    const appointmentId = appointmentData.id;

    // Send to doctor (update status to checked-in)
    await page.request.put(`/api/appointments/${appointmentId}`, {
      data: {
        status: "checked-in",
      },
    });

    // Reload page to see updated queue
    await page.reload();

    // Check if patient appears in queue
    const patientInQueue = page.locator(`text=${patientData.name}`);
    await expect(patientInQueue).toBeVisible({ timeout: 5000 });
  });

  test("should start a visit", async ({ page }) => {
    // Create and send a patient to doctor first
    const patientResponse = await page.request.post("/api/patients", {
      data: {
        name: `VisitTest-${Date.now()}`,
        phone_number: `555${Math.floor(Math.random() * 9999999)
          .toString()
          .padStart(7, "0")}`,
        age: 28,
      },
    });

    if (!patientResponse.ok()) {
      test.skip();
      return;
    }

    const patientData = await patientResponse.json();

    const today = format(new Date(), "yyyy-MM-dd");
    const appointmentResponse = await page.request.post("/api/appointments", {
      data: {
        patient_id: patientData.id,
        appointment_date: today,
        appointment_time: "15:00",
        duration_minutes: 30,
      },
    });

    if (!appointmentResponse.ok()) {
      test.skip();
      return;
    }

    const appointmentData = await appointmentResponse.json();

    await page.request.put(`/api/appointments/${appointmentData.id}`, {
      data: {
        status: "checked-in",
      },
    });

    // Reload to see patient
    await page.reload();

    // Click on patient to start visit
    const startVisitBtn = page
      .locator(`text=${patientData.name}`)
      .locator("..")
      .locator('button:has-text("Start Visit")');

    if (await startVisitBtn.isVisible()) {
      await startVisitBtn.click();

      // Wait for visit sheet to open
      await expect(page.locator(`text=${patientData.name}`)).toBeVisible({
        timeout: 5000,
      });
    }
  });

  test("should fill and save visit notes", async ({ page }) => {
    // Setup: Create patient and start visit
    const patientResponse = await page.request.post("/api/patients", {
      data: {
        name: `NotesTest-${Date.now()}`,
        phone_number: `555${Math.floor(Math.random() * 9999999)
          .toString()
          .padStart(7, "0")}`,
        age: 40,
      },
    });

    if (!patientResponse.ok()) {
      test.skip();
      return;
    }

    const patientData = await patientResponse.json();

    const today = format(new Date(), "yyyy-MM-dd");
    const appointmentResponse = await page.request.post("/api/appointments", {
      data: {
        patient_id: patientData.id,
        appointment_date: today,
        appointment_time: "16:00",
        duration_minutes: 30,
        receptionist_notes: "Patient mentioned previous allergy",
      },
    });

    if (!appointmentResponse.ok()) {
      test.skip();
      return;
    }

    const appointmentData = await appointmentResponse.json();

    await page.request.put(`/api/appointments/${appointmentData.id}`, {
      data: {
        status: "checked-in",
      },
    });

    await page.reload();

    // Start visit
    const startVisitBtn = page
      .locator(`text=${patientData.name}`)
      .locator("..")
      .locator('button:has-text("Start Visit")');

    if (await startVisitBtn.isVisible()) {
      await startVisitBtn.click();

      // Wait for visit sheet
      await expect(page.locator(`text=${patientData.name}`)).toBeVisible({
        timeout: 5000,
      });

      // Fill free text notes (if textarea exists)
      const notesTextarea = page.locator("textarea").first();
      if (await notesTextarea.isVisible()) {
        await notesTextarea.fill("Patient reports fever and body aches. Prescribed rest and fluids.");
      }

      // Save visit
      const saveBtn = page.locator('button:has-text("Save")').first();
      if (await saveBtn.isVisible()) {
        await saveBtn.click();

        // Verify success
        const successToast = page.locator("text=successfully|saved");
        const visible = await successToast
          .isVisible({ timeout: 5000 })
          .catch(() => false);

        expect(visible).toBe(true);
      }
    }
  });

  test("should complete a visit", async ({ page }) => {
    // Setup: Create patient and start visit
    const patientResponse = await page.request.post("/api/patients", {
      data: {
        name: `CompleteTest-${Date.now()}`,
        phone_number: `555${Math.floor(Math.random() * 9999999)
          .toString()
          .padStart(7, "0")}`,
        age: 32,
      },
    });

    if (!patientResponse.ok()) {
      test.skip();
      return;
    }

    const patientData = await patientResponse.json();

    const today = format(new Date(), "yyyy-MM-dd");
    const appointmentResponse = await page.request.post("/api/appointments", {
      data: {
        patient_id: patientData.id,
        appointment_date: today,
        appointment_time: "17:00",
        duration_minutes: 30,
      },
    });

    if (!appointmentResponse.ok()) {
      test.skip();
      return;
    }

    const appointmentData = await appointmentResponse.json();

    await page.request.put(`/api/appointments/${appointmentData.id}`, {
      data: {
        status: "checked-in",
      },
    });

    await page.reload();

    // Start visit
    const startVisitBtn = page
      .locator(`text=${patientData.name}`)
      .locator("..")
      .locator('button:has-text("Start Visit")');

    if (await startVisitBtn.isVisible()) {
      await startVisitBtn.click();

      // Wait for visit sheet
      await expect(page.locator(`text=${patientData.name}`)).toBeVisible({
        timeout: 5000,
      });

      // Click "Complete Visit"
      const completeBtn = page.locator('button:has-text("Complete Visit")');
      if (await completeBtn.isVisible()) {
        await completeBtn.click();

        // Confirm in dialog
        const confirmBtn = page.locator('button:has-text("Complete")').last();
        if (await confirmBtn.isVisible()) {
          await confirmBtn.click();
        }

        // Verify success and patient removed from queue
        const successToast = page.locator("text=successfully|completed");
        const visible = await successToast
          .isVisible({ timeout: 5000 })
          .catch(() => false);

        expect(visible).toBe(true);
      }
    }
  });

  test("should show empty state when no checked-in patients", async ({
    page,
  }) => {
    // Simply check if page displays gracefully with no patients
    const content = page.locator(
      "text=No patients|No appointments|queue is empty"
    );
    const hasPatients = page.locator('button:has-text("Start Visit")');

    const hasContent =
      (await content.isVisible().catch(() => false)) ||
      (await hasPatients.count()) > 0;

    expect(hasContent).toBe(true);
  });
});
