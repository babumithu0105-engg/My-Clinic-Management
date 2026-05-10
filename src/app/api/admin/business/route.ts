import { NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { extractUserContext, validateRole } from "@/lib/api/middleware-helpers";
import { Errors, errorResponse, successResponse } from "@/lib/api/errors";
import { UpdateBusinessSchema } from "@/lib/validations/admin";

// GET /api/admin/business
export async function GET(request: NextRequest) {
  try {
    const context = extractUserContext(request);
    validateRole(context, ["admin"]);

    const { data: business, error } = await supabaseServer
      .from("businesses")
      .select("*")
      .eq("id", context.business_id)
      .single();

    if (error || !business) {
      throw Errors.NOT_FOUND("Business");
    }

    return successResponse(business);
  } catch (error) {
    return errorResponse(error);
  }
}

// PUT /api/admin/business
export async function PUT(request: NextRequest) {
  try {
    const context = extractUserContext(request);
    validateRole(context, ["admin"]);

    const body = await request.json();
    const validated = UpdateBusinessSchema.parse(body);

    const updateData: Record<string, any> = {};
    if (validated.name !== undefined) updateData.name = validated.name;
    if (validated.address !== undefined) updateData.address = validated.address;
    if (validated.phone !== undefined) updateData.phone = validated.phone;
    if (validated.email !== undefined) updateData.email = validated.email;
    updateData.updated_at = new Date().toISOString();

    const { data: updated, error } = await supabaseServer
      .from("businesses")
      .update(updateData)
      .eq("id", context.business_id)
      .select()
      .single();

    if (error) {
      throw Errors.DATABASE_ERROR(error.message);
    }

    return successResponse(updated);
  } catch (error) {
    if (error instanceof Error && error.message.includes("validation")) {
      return errorResponse(Errors.VALIDATION_ERROR(error.message));
    }
    return errorResponse(error);
  }
}
