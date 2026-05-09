import { NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { extractUserContext, validateRole } from "@/lib/api/middleware-helpers";
import { Errors, errorResponse, successResponse } from "@/lib/api/errors";
import { UpdateAppointmentSchema } from "@/lib/validations/appointment";
import type { AppointmentWithPatient } from "@/types";

// PUT /api/appointments/[id]
// Update appointment (reschedule, cancel, status change)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const context = extractUserContext(request);
    validateRole(context, ["receptionist", "admin"]);

    const appointmentId = params.id;
    const body = await request.json();
    const validated = UpdateAppointmentSchema.parse(body);

    // Fetch existing appointment
    const { data: appointment, error: fetchError } = await supabaseServer
      .from("appointments")
      .select("*")
      .eq("id", appointmentId)
      .eq("business_id", context.business_id)
      .maybeSingle();

    if (fetchError) {
      throw Errors.DATABASE_ERROR(fetchError.message);
    }

    if (!appointment) {
      return errorResponse(Errors.NOT_FOUND("Appointment not found"));
    }

    // Validate status change rules
    if (validated.status === "cancelled") {
      if (!["scheduled", "checked-in"].includes(appointment.status)) {
        return errorResponse(
          Errors.BAD_REQUEST(
            `Cannot cancel appointment with status "${appointment.status}"`
          )
        );
      }
    }

    // Validate reschedule (date/time change) rules
    if ((validated.appointment_date || validated.appointment_time) && validated.status !== "cancelled") {
      if (appointment.status !== "scheduled") {
        return errorResponse(
          Errors.BAD_REQUEST(
            `Cannot reschedule appointment with status "${appointment.status}"`
          )
        );
      }
    }

    // Build update object
    const updateData: Record<string, any> = {};
    if (validated.appointment_date !== undefined) updateData.appointment_date = validated.appointment_date;
    if (validated.appointment_time !== undefined) updateData.appointment_time = validated.appointment_time;
    if (validated.duration_minutes !== undefined) updateData.duration_minutes = validated.duration_minutes;
    if (validated.status !== undefined) updateData.status = validated.status;
    if (validated.receptionist_notes !== undefined) updateData.receptionist_notes = validated.receptionist_notes;

    if (Object.keys(updateData).length === 0) {
      return errorResponse(Errors.BAD_REQUEST("No valid fields to update"));
    }

    // Update appointment
    const { data: updated, error: updateError } = await supabaseServer
      .from("appointments")
      .update(updateData)
      .eq("id", appointmentId)
      .eq("business_id", context.business_id)
      .select("*, patient:patients(id, name, phone_number, age, sex)")
      .single();

    if (updateError) {
      throw Errors.DATABASE_ERROR(updateError.message);
    }

    return successResponse(updated as AppointmentWithPatient);
  } catch (error) {
    if (error instanceof Error && error.message.includes("validation")) {
      return errorResponse(Errors.VALIDATION_ERROR(error.message));
    }
    return errorResponse(error);
  }
}
