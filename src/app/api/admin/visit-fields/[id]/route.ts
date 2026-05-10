import { NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { extractUserContext, validateRole } from "@/lib/api/middleware-helpers";
import { Errors, errorResponse, successResponse } from "@/lib/api/errors";
import { UpdateVisitFieldSchema } from "@/lib/validations/admin";

// PUT /api/admin/visit-fields/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const context = extractUserContext(request);
    validateRole(context, ["admin"]);

    const { id } = params;
    const body = await request.json();

    // Verify field exists and belongs to business
    const { data: field, error: getError } = await supabaseServer
      .from("visit_documentation_fields")
      .select("*")
      .eq("id", id)
      .eq("business_id", context.business_id)
      .single();

    if (getError || !field) {
      throw Errors.NOT_FOUND("Visit field");
    }

    // Handle move_up / move_down actions
    if (body.action === "move_up" || body.action === "move_down") {
      const direction = body.action === "move_up" ? -1 : 1;
      const operator = direction === -1 ? "<" : ">";

      // Get the adjacent field to swap with
      const { data: adjacentFields, error: adjacentError } = await supabaseServer
        .from("visit_documentation_fields")
        .select("*")
        .eq("business_id", context.business_id)
        .filter("field_order", operator as any, field.field_order)
        .order("field_order", { ascending: direction === 1 })
        .limit(1);

      if (adjacentError) {
        throw Errors.DATABASE_ERROR(adjacentError.message);
      }

      if (!adjacentFields || adjacentFields.length === 0) {
        // Already at the top/bottom, cannot move further
        return errorResponse(Errors.BAD_REQUEST(`Cannot move ${body.action === "move_up" ? "up" : "down"}`));
      }

      const adjacentField = adjacentFields[0];

      // Swap field_order values
      const { error: updateError } = await supabaseServer
        .from("visit_documentation_fields")
        .update({ field_order: adjacentField.field_order })
        .eq("id", id);

      if (updateError) {
        throw Errors.DATABASE_ERROR(updateError.message);
      }

      const { error: updateAdjacentError } = await supabaseServer
        .from("visit_documentation_fields")
        .update({ field_order: field.field_order })
        .eq("id", adjacentField.id);

      if (updateAdjacentError) {
        throw Errors.DATABASE_ERROR(updateAdjacentError.message);
      }

      // Return updated field
      const { data: updated, error: finalGetError } = await supabaseServer
        .from("visit_documentation_fields")
        .select("*")
        .eq("id", id)
        .single();

      if (finalGetError) {
        throw Errors.DATABASE_ERROR(finalGetError.message);
      }

      return successResponse(updated);
    }

    // Regular field update
    const validated = UpdateVisitFieldSchema.parse(body);

    const updateData: Record<string, any> = {};
    if (validated.field_name !== undefined) updateData.field_name = validated.field_name;
    if (validated.field_type !== undefined) updateData.field_type = validated.field_type;
    if (validated.is_required !== undefined) updateData.is_required = validated.is_required;
    if (validated.dropdown_options !== undefined) updateData.dropdown_options = validated.dropdown_options;

    const { data: updated, error: updateError } = await supabaseServer
      .from("visit_documentation_fields")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      throw Errors.DATABASE_ERROR(updateError.message);
    }

    return successResponse(updated);
  } catch (error) {
    if (error instanceof Error && error.message.includes("validation")) {
      return errorResponse(Errors.VALIDATION_ERROR(error.message));
    }
    return errorResponse(error);
  }
}

// DELETE /api/admin/visit-fields/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const context = extractUserContext(request);
    validateRole(context, ["admin"]);

    const { id } = params;

    // Verify field exists and belongs to business
    const { data: field, error: getError } = await supabaseServer
      .from("visit_documentation_fields")
      .select("*")
      .eq("id", id)
      .eq("business_id", context.business_id)
      .single();

    if (getError || !field) {
      throw Errors.NOT_FOUND("Visit field");
    }

    // Delete the field
    const { error: deleteError } = await supabaseServer
      .from("visit_documentation_fields")
      .delete()
      .eq("id", id);

    if (deleteError) {
      throw Errors.DATABASE_ERROR(deleteError.message);
    }

    return successResponse({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}
