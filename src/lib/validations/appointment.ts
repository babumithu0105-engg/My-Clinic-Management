import { z } from "zod";

export const CreateAppointmentSchema = z.object({
  patient_id: z.string().uuid("Patient ID must be a valid UUID"),
  appointment_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  appointment_time: z.string().regex(/^\d{2}:\d{2}$/, "Time must be in HH:MM format"),
  duration_minutes: z.number().int("Duration must be an integer").positive("Duration must be positive"),
  receptionist_notes: z.string().max(1000, "Notes must be 1000 characters or less").nullable().optional(),
  is_walk_in: z.boolean().optional().default(false),
});

export const UpdateAppointmentSchema = z.object({
  appointment_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").optional(),
  appointment_time: z.string().regex(/^\d{2}:\d{2}$/, "Time must be in HH:MM format").optional(),
  duration_minutes: z.number().int("Duration must be an integer").positive("Duration must be positive").optional(),
  status: z.enum(["scheduled", "checked-in", "completed", "no-show", "cancelled"]).optional(),
  receptionist_notes: z.string().max(1000, "Notes must be 1000 characters or less").nullable().optional(),
});

export type CreateAppointmentInput = z.infer<typeof CreateAppointmentSchema>;
export type UpdateAppointmentInput = z.infer<typeof UpdateAppointmentSchema>;
