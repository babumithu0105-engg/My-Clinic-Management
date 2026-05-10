import { z } from "zod";

// Business info update (name, address, phone, email)
export const UpdateBusinessSchema = z.object({
  name: z.string().min(1, "Business name is required").max(255),
  address: z.string().max(500).nullable().optional(),
  phone: z.string().max(20).nullable().optional(),
  email: z.string().email().nullable().optional(),
});

export type UpdateBusinessInput = z.infer<typeof UpdateBusinessSchema>;

// Working Hours - single day
export const WorkingHoursDaySchema = z.object({
  day_of_week: z.number().int().min(0).max(6),
  is_open: z.boolean(),
  start_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/).nullable().optional(),
  end_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/).nullable().optional(),
});

// Working Hours - all 7 days at once
export const UpdateWorkingHoursSchema = z.array(WorkingHoursDaySchema).length(7, "Must provide all 7 days");

export type UpdateWorkingHoursInput = z.infer<typeof UpdateWorkingHoursSchema>;

// Holiday creation
export const CreateHolidaySchema = z.object({
  holiday_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  reason: z.string().max(255).nullable().optional(),
});

export type CreateHolidayInput = z.infer<typeof CreateHolidaySchema>;

// Visit Field - creation
export const CreateVisitFieldSchema = z.object({
  field_name: z.string().min(1, "Field name is required").max(255),
  field_type: z.enum(["text", "dropdown", "checkbox", "date", "number"]),
  is_required: z.boolean().default(false),
  dropdown_options: z.array(z.string()).nullable().optional(),
});

// Visit Field - update (all fields optional)
export const UpdateVisitFieldSchema = CreateVisitFieldSchema.partial();

export type CreateVisitFieldInput = z.infer<typeof CreateVisitFieldSchema>;
export type UpdateVisitFieldInput = z.infer<typeof UpdateVisitFieldSchema>;
