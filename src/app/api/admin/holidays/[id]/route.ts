import { NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { extractUserContext, validateRole } from "@/lib/api/middleware-helpers";
import { Errors, errorResponse, successResponse } from "@/lib/api/errors";

// DELETE /api/admin/holidays/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const context = extractUserContext(request);
    validateRole(context, ["admin"]);

    const { id } = params;

    // Verify holiday exists and belongs to business
    const { data: holiday, error: getError } = await supabaseServer
      .from("holidays")
      .select("*")
      .eq("id", id)
      .eq("business_id", context.business_id)
      .single();

    if (getError || !holiday) {
      throw Errors.NOT_FOUND("Holiday");
    }

    // Delete holiday
    const { error: deleteError } = await supabaseServer
      .from("holidays")
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
