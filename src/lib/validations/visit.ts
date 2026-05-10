import { z } from "zod";

export const CreateVisitSchema = z.object({
  appointment_id: z.string().uuid("Appointment ID must be a valid UUID"),
});

export const UpdateVisitSchema = z.object({
  free_text_notes: z.string().max(5000, "Notes must be 5000 characters or less").nullable().optional(),
  field_values: z.record(z.string(), z.string().nullable().optional()).optional(),
  action: z.enum(["save", "complete"]).optional(),
});

export type CreateVisitInput = z.infer<typeof CreateVisitSchema>;
export type UpdateVisitInput = z.infer<typeof UpdateVisitSchema>;
