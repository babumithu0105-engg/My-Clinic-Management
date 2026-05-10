import { describe, it, expect } from "vitest";
import { CreatePatientSchema, UpdatePatientSchema } from "@/lib/validations/patient";

describe("Patient Validations", () => {
  describe("CreatePatientSchema", () => {
    it("should validate a valid patient", () => {
      const validPatient = {
        name: "John Doe",
        phone_number: "1234567890",
        age: 30,
        sex: "M",
        address: "123 Main St",
      };
      const result = CreatePatientSchema.safeParse(validPatient);
      expect(result.success).toBe(true);
    });

    it("should reject missing name", () => {
      const invalidPatient = {
        phone_number: "1234567890",
      };
      const result = CreatePatientSchema.safeParse(invalidPatient);
      expect(result.success).toBe(false);
    });

    it("should reject missing phone number", () => {
      const invalidPatient = {
        name: "John Doe",
      };
      const result = CreatePatientSchema.safeParse(invalidPatient);
      expect(result.success).toBe(false);
    });

    it("should reject short phone number", () => {
      const invalidPatient = {
        name: "John Doe",
        phone_number: "12345",
      };
      const result = CreatePatientSchema.safeParse(invalidPatient);
      expect(result.success).toBe(false);
    });

    it("should reject invalid sex value", () => {
      const invalidPatient = {
        name: "John Doe",
        phone_number: "1234567890",
        sex: "X",
      };
      const result = CreatePatientSchema.safeParse(invalidPatient);
      expect(result.success).toBe(false);
    });

    it("should allow optional fields", () => {
      const minimalPatient = {
        name: "Jane Doe",
        phone_number: "9876543210",
      };
      const result = CreatePatientSchema.safeParse(minimalPatient);
      expect(result.success).toBe(true);
    });

    it("should reject age as string", () => {
      const invalidPatient = {
        name: "John Doe",
        phone_number: "1234567890",
        age: "30",
      };
      const result = CreatePatientSchema.safeParse(invalidPatient);
      expect(result.success).toBe(false);
    });

    it("should reject address over 500 characters", () => {
      const invalidPatient = {
        name: "John Doe",
        phone_number: "1234567890",
        address: "a".repeat(501),
      };
      const result = CreatePatientSchema.safeParse(invalidPatient);
      expect(result.success).toBe(false);
    });
  });

  describe("UpdatePatientSchema", () => {
    it("should allow partial updates", () => {
      const partialUpdate = {
        name: "Jane Smith",
      };
      const result = UpdatePatientSchema.safeParse(partialUpdate);
      expect(result.success).toBe(true);
    });

    it("should allow updating phone only", () => {
      const update = {
        phone_number: "5555555555",
      };
      const result = UpdatePatientSchema.safeParse(update);
      expect(result.success).toBe(true);
    });

    it("should reject invalid sex in update", () => {
      const invalidUpdate = {
        sex: "Invalid",
      };
      const result = UpdatePatientSchema.safeParse(invalidUpdate);
      expect(result.success).toBe(false);
    });

    it("should allow empty object", () => {
      const result = UpdatePatientSchema.safeParse({});
      expect(result.success).toBe(true);
    });
  });
});
