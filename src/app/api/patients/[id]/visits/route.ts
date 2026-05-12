import { NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { extractUserContext, validateRole } from "@/lib/api/middleware-helpers";
import { Errors, errorResponse, successResponse } from "@/lib/api/errors";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const context = extractUserContext(request);
    validateRole(context, ["doctor"]);

    // Verify patient exists in this business
    const { data: patient, error: patientError } = await supabaseServer
      .from("patients")
      .select("id")
      .eq("id", params.id)
      .eq("business_id", context.business_id)
      .single();

    if (patientError || !patient) {
      return errorResponse(
        Errors.NOT_FOUND("Patient not found")
      );
    }

    // Fetch all appointments for this patient
    const { data: appointments, error: appointmentsError } = await supabaseServer
      .from("appointments")
      .select("id, appointment_date, appointment_time, duration_minutes, status")
      .eq("patient_id", params.id)
      .eq("business_id", context.business_id)
      .order("appointment_date", { ascending: false });

    if (appointmentsError) {
      throw Errors.DATABASE_ERROR(appointmentsError.message);
    }

    // Fetch visits for these appointments
    const visits = [];

    for (const appointment of appointments || []) {
      const { data: visit, error: visitError } = await supabaseServer
        .from("visits")
        .select("*")
        .eq("appointment_id", appointment.id)
        .maybeSingle();

      if (visitError) {
        console.error("Error fetching visit:", visitError);
        continue;
      }

      if (!visit) {
        continue;
      }

      // Fetch field values for this visit
      const { data: fieldValues } = await supabaseServer
        .from("visit_field_values")
        .select("field_id, field_value")
        .eq("visit_id", visit.id);

      const fieldValuesRecord: Record<string, string | null> = {};
      (fieldValues || []).forEach((fv) => {
        fieldValuesRecord[fv.field_id] = fv.field_value;
      });

      visits.push({
        id: visit.id,
        appointment_id: visit.appointment_id,
        appointment_date: appointment.appointment_date,
        appointment_time: appointment.appointment_time,
        status: appointment.status,
        duration_minutes: appointment.duration_minutes,
        check_in_time: visit.check_in_time,
        completion_time: visit.completion_time,
        free_text_notes: visit.free_text_notes,
        field_values: fieldValuesRecord,
      });
    }

    return successResponse({ visits });
  } catch (error) {
    return errorResponse(error);
  }
}
