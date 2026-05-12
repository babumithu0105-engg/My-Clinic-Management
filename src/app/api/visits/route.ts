import { NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { extractUserContext, validateRole } from "@/lib/api/middleware-helpers";
import { Errors, errorResponse, successResponse } from "@/lib/api/errors";
import { CreateVisitSchema } from "@/lib/validations/visit";
import type { VisitWithFields } from "@/types";

// Helper: Fetch visit with field values as Record
async function fetchVisitWithFields(
  businessId: string,
  visitId: string
): Promise<VisitWithFields | null> {
  // Fetch visit
  const { data: visit, error: visitError } = await supabaseServer
    .from("visits")
    .select("*")
    .eq("id", visitId)
    .eq("business_id", businessId)
    .single();

  if (visitError || !visit) {
    return null;
  }

  // Fetch field values
  const { data: fieldValues, error: fieldError } = await supabaseServer
    .from("visit_field_values")
    .select("field_id, field_value")
    .eq("visit_id", visitId);

  if (fieldError) {
    console.error("Error fetching field values:", fieldError);
  }

  // Convert to Record
  const fieldValuesRecord: Record<string, string | null> = {};
  (fieldValues || []).forEach((fv) => {
    fieldValuesRecord[fv.field_id] = fv.field_value;
  });

  return {
    ...visit,
    field_values: fieldValuesRecord,
  } as VisitWithFields;
}

// GET /api/visits
// List all visits with appointments for the business
export async function GET(request: NextRequest) {
  try {
    const context = extractUserContext(request);
    validateRole(context, ["doctor"]);

    // Fetch all visits for this business with their appointments
    const { data: visits, error: visitsError } = await supabaseServer
      .from("visits")
      .select(
        `
        id,
        business_id,
        appointment_id,
        check_in_time,
        completion_time,
        free_text_notes,
        field_values,
        created_at,
        updated_at,
        appointments (
          id,
          business_id,
          patient_id,
          appointment_date,
          appointment_time,
          duration_minutes,
          status,
          is_walk_in,
          receptionist_notes,
          created_at,
          updated_at,
          patients (
            id,
            name,
            phone_number,
            age,
            sex
          )
        )
      `
      )
      .eq("business_id", context.business_id)
      .order("created_at", { ascending: false });

    if (visitsError) {
      throw Errors.DATABASE_ERROR(visitsError.message);
    }

    // Transform the data to match expected format
    const transformedVisits = await Promise.all(
      (visits || []).map(async (visit: any) => {
        const fieldValuesRecord: Record<string, string | null> = {};

        // Fetch field values
        const { data: fieldValues } = await supabaseServer
          .from("visit_field_values")
          .select("field_id, field_value")
          .eq("visit_id", visit.id);

        (fieldValues || []).forEach((fv: any) => {
          fieldValuesRecord[fv.field_id] = fv.field_value;
        });

        return {
          visits: {
            ...visit,
            field_values: fieldValuesRecord,
          },
          appointments: visit.appointments
            ? {
                ...visit.appointments,
                patient: visit.appointments.patients,
              }
            : null,
        };
      })
    );

    return successResponse({
      visits: transformedVisits.map((record) => ({
        appointment: record.appointments,
        visit: record.visits,
      })),
    });
  } catch (error) {
    return errorResponse(error);
  }
}

// POST /api/visits
// Create a new visit (check-in patient)
export async function POST(request: NextRequest) {
  try {
    const context = extractUserContext(request);
    validateRole(context, ["doctor"]);

    const body = await request.json();
    const validated = CreateVisitSchema.parse(body);

    // Verify appointment exists and belongs to this business
    const { data: appointment, error: appointmentError } = await supabaseServer
      .from("appointments")
      .select("id, status")
      .eq("id", validated.appointment_id)
      .eq("business_id", context.business_id)
      .single();

    if (appointmentError || !appointment) {
      return errorResponse(Errors.NOT_FOUND("Appointment not found or does not belong to your business"));
    }

    // Check if visit already exists (idempotent)
    const { data: existingVisit, error: checkError } = await supabaseServer
      .from("visits")
      .select("id")
      .eq("appointment_id", validated.appointment_id)
      .maybeSingle();

    if (checkError) {
      throw Errors.DATABASE_ERROR(checkError.message);
    }

    if (existingVisit) {
      // Return existing visit
      const visit = await fetchVisitWithFields(context.business_id, existingVisit.id);
      return successResponse({ data: visit });
    }

    // Create new visit with check-in time
    const now = new Date().toISOString();
    const { data: newVisit, error: insertError } = await supabaseServer
      .from("visits")
      .insert([
        {
          business_id: context.business_id,
          appointment_id: validated.appointment_id,
          check_in_time: now,
        },
      ])
      .select()
      .single();

    if (insertError) {
      throw Errors.DATABASE_ERROR(insertError.message);
    }

    // Fetch with field values
    const visit = await fetchVisitWithFields(context.business_id, newVisit.id);

    // Update appointment status to checked-in
    await supabaseServer
      .from("appointments")
      .update({ status: "checked-in" })
      .eq("id", validated.appointment_id)
      .eq("business_id", context.business_id);

    return successResponse({ data: visit }, 201);
  } catch (error) {
    if (error instanceof Error && error.message.includes("validation")) {
      return errorResponse(Errors.VALIDATION_ERROR(error.message));
    }
    return errorResponse(error);
  }
}
