import { describe, it, expect } from "vitest";
import {
  UpdateBusinessSchema,
  UpdateWorkingHoursSchema,
  CreateHolidaySchema,
  CreateVisitFieldSchema,
} from "@/lib/validations/admin";

describe("Admin Validations", () => {
  describe("UpdateBusinessSchema", () => {
    it("should validate a complete business update", () => {
      const update = {
        name: "City Clinic",
        address: "123 Main St, City",
        phone: "+1234567890",
        email: "clinic@example.com",
      };
      const result = UpdateBusinessSchema.safeParse(update);
      expect(result.success).toBe(true);
    });

    it("should allow partial updates", () => {
      const update = {
        name: "Updated Clinic Name",
      };
      const result = UpdateBusinessSchema.safeParse(update);
      expect(result.success).toBe(true);
    });

    it("should require name field", () => {
      const result = UpdateBusinessSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  describe("UpdateWorkingHoursSchema", () => {
    it("should validate exactly 7 days", () => {
      const hours = Array(7)
        .fill(null)
        .map((_, i) => ({
          day_of_week: i,
          is_open: i < 5,
          start_time: "09:00",
          end_time: "17:00",
        }));
      const result = UpdateWorkingHoursSchema.safeParse(hours);
      expect(result.success).toBe(true);
    });

    it("should reject 6 days", () => {
      const hours = Array(6)
        .fill(null)
        .map((_, i) => ({
          day_of_week: i,
          is_open: true,
          start_time: "09:00",
          end_time: "17:00",
        }));
      const result = UpdateWorkingHoursSchema.safeParse(hours);
      expect(result.success).toBe(false);
    });

    it("should reject 8 days", () => {
      const hours = Array(8)
        .fill(null)
        .map((_, i) => ({
          day_of_week: i % 7,
          is_open: true,
          start_time: "09:00",
          end_time: "17:00",
        }));
      const result = UpdateWorkingHoursSchema.safeParse(hours);
      expect(result.success).toBe(false);
    });

    it("should allow closed days without times", () => {
      const hours = [
        {
          day_of_week: 0,
          is_open: false,
        },
        ...Array(6)
          .fill(null)
          .map((_, i) => ({
            day_of_week: i + 1,
            is_open: true,
            start_time: "09:00",
            end_time: "17:00",
          })),
      ];
      const result = UpdateWorkingHoursSchema.safeParse(hours);
      expect(result.success).toBe(true);
    });
  });

  describe("CreateHolidaySchema", () => {
    it("should validate with valid date", () => {
      const holiday = {
        holiday_date: "2026-12-25",
        reason: "Christmas",
      };
      const result = CreateHolidaySchema.safeParse(holiday);
      expect(result.success).toBe(true);
    });

    it("should allow without reason", () => {
      const holiday = {
        holiday_date: "2026-01-01",
      };
      const result = CreateHolidaySchema.safeParse(holiday);
      expect(result.success).toBe(true);
    });

    it("should reject invalid date format", () => {
      const holiday = {
        holiday_date: "2026/12/25",
      };
      const result = CreateHolidaySchema.safeParse(holiday);
      expect(result.success).toBe(false);
    });

    it("should reject missing date", () => {
      const holiday = {
        reason: "Holiday",
      };
      const result = CreateHolidaySchema.safeParse(holiday);
      expect(result.success).toBe(false);
    });
  });

  describe("CreateVisitFieldSchema", () => {
    it("should validate text field", () => {
      const field = {
        field_name: "Symptoms",
        field_type: "text",
        is_required: true,
      };
      const result = CreateVisitFieldSchema.safeParse(field);
      expect(result.success).toBe(true);
    });

    it("should validate dropdown with options", () => {
      const field = {
        field_name: "Severity",
        field_type: "dropdown",
        is_required: true,
        dropdown_options: ["Mild", "Moderate", "Severe"],
      };
      const result = CreateVisitFieldSchema.safeParse(field);
      expect(result.success).toBe(true);
    });

    it("should validate checkbox field", () => {
      const field = {
        field_name: "Follow-up Required",
        field_type: "checkbox",
        is_required: false,
      };
      const result = CreateVisitFieldSchema.safeParse(field);
      expect(result.success).toBe(true);
    });

    it("should validate date field", () => {
      const field = {
        field_name: "Appointment Date",
        field_type: "date",
        is_required: true,
      };
      const result = CreateVisitFieldSchema.safeParse(field);
      expect(result.success).toBe(true);
    });

    it("should reject invalid field type", () => {
      const field = {
        field_name: "Invalid",
        field_type: "invalid_type",
      };
      const result = CreateVisitFieldSchema.safeParse(field);
      expect(result.success).toBe(false);
    });

    it("should reject missing field_name", () => {
      const field = {
        field_type: "text",
      };
      const result = CreateVisitFieldSchema.safeParse(field);
      expect(result.success).toBe(false);
    });
  });
});
