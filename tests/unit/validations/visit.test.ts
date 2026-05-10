import { describe, it, expect } from "vitest";
import {
  CreateVisitSchema,
  UpdateVisitSchema,
} from "@/lib/validations/visit";

describe("Visit Validations", () => {
  describe("CreateVisitSchema", () => {
    it("should validate with valid UUID", () => {
      const valid = {
        appointment_id: "550e8400-e29b-41d4-a716-446655440000",
      };
      const result = CreateVisitSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("should reject non-UUID string", () => {
      const invalid = {
        appointment_id: "not-a-uuid",
      };
      const result = CreateVisitSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("should reject missing appointment_id", () => {
      const invalid = {};
      const result = CreateVisitSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe("UpdateVisitSchema", () => {
    it("should allow action save", () => {
      const update = {
        action: "save",
      };
      const result = UpdateVisitSchema.safeParse(update);
      expect(result.success).toBe(true);
    });

    it("should allow action complete", () => {
      const update = {
        action: "complete",
      };
      const result = UpdateVisitSchema.safeParse(update);
      expect(result.success).toBe(true);
    });

    it("should reject invalid action", () => {
      const update = {
        action: "delete",
      };
      const result = UpdateVisitSchema.safeParse(update);
      expect(result.success).toBe(false);
    });

    it("should allow free_text_notes", () => {
      const update = {
        free_text_notes: "Patient presented with fever and cough",
      };
      const result = UpdateVisitSchema.safeParse(update);
      expect(result.success).toBe(true);
    });

    it("should reject notes over 5000 characters", () => {
      const update = {
        free_text_notes: "a".repeat(5001),
      };
      const result = UpdateVisitSchema.safeParse(update);
      expect(result.success).toBe(false);
    });

    it("should allow field_values", () => {
      const update = {
        field_values: {
          symptoms: "fever, cough",
          diagnosis: "common cold",
        },
      };
      const result = UpdateVisitSchema.safeParse(update);
      expect(result.success).toBe(true);
    });

    it("should allow empty update", () => {
      const result = UpdateVisitSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it("should allow combination of fields", () => {
      const update = {
        action: "save",
        free_text_notes: "Follow up in 3 days",
        field_values: {
          symptom: "headache",
        },
      };
      const result = UpdateVisitSchema.safeParse(update);
      expect(result.success).toBe(true);
    });
  });
});
