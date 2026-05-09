import { z } from "zod";

export const CreatePatientSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  phone_number: z.string().min(7, "Phone must be at least 7 digits").max(20),
  age: z.number().int().positive("Age must be a positive number").nullable().optional(),
  sex: z.enum(["M", "F", "Other"]).nullable().optional(),
  address: z.string().max(500).nullable().optional(),
});

export const UpdatePatientSchema = CreatePatientSchema.partial();

export const SearchPatientSchema = z.object({
  search: z.string().min(1, "Search query required"),
});

export type CreatePatientInput = z.infer<typeof CreatePatientSchema>;
export type UpdatePatientInput = z.infer<typeof UpdatePatientSchema>;
export type SearchPatientInput = z.infer<typeof SearchPatientSchema>;
