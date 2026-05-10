import { describe, it, expect } from "vitest";
import { CreateAppointmentSchema, UpdateAppointmentSchema } from "@/lib/validations/appointment";

describe("Appointment Validations", () => {
  describe("CreateAppointmentSchema", () => {
    it("should validate a valid scheduled appointment", () => {
      const validAppt = {
        patient_id: "550e8400-e29b-41d4-a716-446655440000",
        appointment_date: "2026-05-15",
        appointment_time: "14:30",
        duration_minutes: 30,
      };
      const result = CreateAppointmentSchema.safeParse(validAppt);
      expect(result.success).toBe(true);
    });

    it("should validate a walk-in without appointment_time", () => {
      const walkIn = {
        patient_id: "550e8400-e29b-41d4-a716-446655440000",
        appointment_date: "2026-05-15",
        duration_minutes: 30,
        is_walk_in: true,
      };
      const result = CreateAppointmentSchema.safeParse(walkIn);
      expect(result.success).toBe(true);
    });

    it("should reject invalid date format", () => {
      const invalid = {
        patient_id: "550e8400-e29b-41d4-a716-446655440000",
        appointment_date: "2026/05/15",
        appointment_time: "14:30",
        duration_minutes: 30,
      };
      const result = CreateAppointmentSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("should reject invalid time format", () => {
      const invalid = {
        patient_id: "550e8400-e29b-41d4-a716-446655440000",
        appointment_date: "2026-05-15",
        appointment_time: "2:30pm",
        duration_minutes: 30,
      };
      const result = CreateAppointmentSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("should reject zero duration", () => {
      const invalid = {
        patient_id: "550e8400-e29b-41d4-a716-446655440000",
        appointment_date: "2026-05-15",
        appointment_time: "14:30",
        duration_minutes: 0,
      };
      const result = CreateAppointmentSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("should reject negative duration", () => {
      const invalid = {
        patient_id: "550e8400-e29b-41d4-a716-446655440000",
        appointment_date: "2026-05-15",
        appointment_time: "14:30",
        duration_minutes: -30,
      };
      const result = CreateAppointmentSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("should reject invalid patient_id UUID", () => {
      const invalid = {
        patient_id: "not-a-uuid",
        appointment_date: "2026-05-15",
        appointment_time: "14:30",
        duration_minutes: 30,
      };
      const result = CreateAppointmentSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("should allow receptionist notes", () => {
      const withNotes = {
        patient_id: "550e8400-e29b-41d4-a716-446655440000",
        appointment_date: "2026-05-15",
        appointment_time: "14:30",
        duration_minutes: 30,
        receptionist_notes: "Patient called to confirm",
      };
      const result = CreateAppointmentSchema.safeParse(withNotes);
      expect(result.success).toBe(true);
    });
  });

  describe("UpdateAppointmentSchema", () => {
    it("should allow status update to checked-in", () => {
      const update = {
        status: "checked-in",
      };
      const result = UpdateAppointmentSchema.safeParse(update);
      expect(result.success).toBe(true);
    });

    it("should allow status update to completed", () => {
      const update = {
        status: "completed",
      };
      const result = UpdateAppointmentSchema.safeParse(update);
      expect(result.success).toBe(true);
    });

    it("should reject invalid status", () => {
      const update = {
        status: "invalid_status",
      };
      const result = UpdateAppointmentSchema.safeParse(update);
      expect(result.success).toBe(false);
    });

    it("should allow partial date/time update", () => {
      const update = {
        appointment_date: "2026-05-20",
      };
      const result = UpdateAppointmentSchema.safeParse(update);
      expect(result.success).toBe(true);
    });

    it("should allow empty update", () => {
      const result = UpdateAppointmentSchema.safeParse({});
      expect(result.success).toBe(true);
    });
  });
});
