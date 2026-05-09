import { NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { extractUserContext, validateRole } from "@/lib/api/middleware-helpers";
import { Errors, errorResponse, successResponse } from "@/lib/api/errors";
import { UpdateVisitSchema } from "@/lib/validations/visit";
import type { VisitWithFields } from "@/types";

// Helper: Fetch visit with field values as Record
async function fetchVisitWithFields(
  businessId: string,
  visitId: string
): Promise<VisitWithFields | null> {
  const { data: visit, error: visitError } = await supabaseServer
    .from("visits")
    .select("*")
    .eq("id", visitId)
    .eq("business_id", businessId)
    .single();

  if (visitError || !visit) {
    return null;
  }

  const { data: fieldValues, error: fieldError } = await supabaseServer
    .from("visit_field_values")
    .select("field_id, field_value")
    .eq("visit_id", visitId);

  if (fieldError) {
    console.error("Error fetching field values:", fieldError);
  }

  const fieldValuesRecord: Record<string, string | null> = {};
  (fieldValues || []).forEach((fv) => {
    fieldValuesRecord[fv.field_id] = fv.field_value;
  });

  return {
    ...visit,
    field_values: fieldValuesRecord,
  } as VisitWithFields;
}

// GET /api/visits/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const context = extractUserContext(request);
    const { id } = params;

    const visit = await fetchVisitWithFields(context.business_id, id);

    if (!visit) {
      return errorResponse(Errors.NOT_FOUND("Visit not found or does not belong to your business"));
    }

    return successResponse(visit);
  } catch (error) {
    return errorResponse(error);
  }
}

// PUT /api/visits/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const context = extractUserContext(request);
    validateRole(context, ["doctor"]);
    const { id } = params;

    const body = await request.json();
    const validated = UpdateVisitSchema.parse(body);

    // Fetch existing visit
    const { data: visit, error: visitError } = await supabaseServer
      .from("visits")
      .select("*, appointment:appointments(id)")
      .eq("id", id)
      .eq("business_id", context.business_id)
      .single();

    if (visitError || !visit) {
      return errorResponse(Errors.NOT_FOUND("Visit not found or does not belong to your business"));
    }

    // Build update object
    const updateData: Record<string, any> = {};
    if (validated.free_text_notes !== undefined) {
      updateData.free_text_notes = validated.free_text_notes;
    }
    if (validated.action === "complete") {
      updateData.completion_time = new Date().toISOString();
      updateData.updated_at = new Date().toISOString();
    }

    // Update visit
    if (Object.keys(updateData).length > 0) {
      const { error: updateError } = await supabaseServer
        .from("visits")
        .update(updateData)
        .eq("id", id)
        .eq("business_id", context.business_id);

      if (updateError) {
        throw Errors.DATABASE_ERROR(updateError.message);
      }
    }

    // Upsert field values
    if (validated.field_values) {
      const fieldValuesToInsert = Object.entries(validated.field_values).map(([fieldId, value]) => ({
        visit_id: id,
        field_id: fieldId,
        field_value: value,
      }));

      // First delete existing values for these fields
      const fieldIds = Object.keys(validated.field_values);
      if (fieldIds.length > 0) {
        await supabaseServer
          .from("visit_field_values")
          .delete()
          .eq("visit_id", id)
          .in("field_id", fieldIds);
      }

      // Insert new values
      if (fieldValuesToInsert.length > 0) {
        const { error: insertError } = await supabaseServer
          .from("visit_field_values")
          .insert(fieldValuesToInsert);

        if (insertError) {
          throw Errors.DATABASE_ERROR(insertError.message);
        }
      }
    }

    // If completing, update appointment status
    if (validated.action === "complete") {
      const appointmentId = visit.appointment?.id || visit.appointment_id;
      const { error: appointmentError } = await supabaseServer
        .from("appointments")
        .update({ status: "completed" })
        .eq("id", appointmentId)
        .eq("business_id", context.business_id);

      if (appointmentError) {
        console.error("Error updating appointment status:", appointmentError);
      }
    }

    // Return updated visit
    const updatedVisit = await fetchVisitWithFields(context.business_id, id);
    return successResponse(updatedVisit);
  } catch (error) {
    if (error instanceof Error && error.message.includes("validation")) {
      return errorResponse(Errors.VALIDATION_ERROR(error.message));
    }
    return errorResponse(error);
  }
}
