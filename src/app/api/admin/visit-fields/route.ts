import { NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { extractUserContext, validateRole } from "@/lib/api/middleware-helpers";
import { Errors, errorResponse, successResponse } from "@/lib/api/errors";
import { CreateVisitFieldSchema } from "@/lib/validations/admin";

// GET /api/admin/visit-fields
export async function GET(request: NextRequest) {
  try {
    const context = extractUserContext(request);
    validateRole(context, ["admin"]);

    const { data: fields, error } = await supabaseServer
      .from("visit_documentation_fields")
      .select("*")
      .eq("business_id", context.business_id)
      .order("field_order", { ascending: true });

    if (error) {
      throw Errors.DATABASE_ERROR(error.message);
    }

    return successResponse({ fields });
  } catch (error) {
    return errorResponse(error);
  }
}

// POST /api/admin/visit-fields
export async function POST(request: NextRequest) {
  try {
    const context = extractUserContext(request);
    validateRole(context, ["admin"]);

    const body = await request.json();
    const validated = CreateVisitFieldSchema.parse(body);

    // Get the max field_order for this business
    const { data: maxOrderData, error: maxError } = await supabaseServer
      .from("visit_documentation_fields")
      .select("field_order")
      .eq("business_id", context.business_id)
      .order("field_order", { ascending: false })
      .limit(1);

    if (maxError && maxError.code !== "PGRST116") {
      throw Errors.DATABASE_ERROR(maxError.message);
    }

    const nextOrder = (maxOrderData && maxOrderData.length > 0) ? (maxOrderData[0].field_order || 0) + 1 : 1;

    const { data: field, error } = await supabaseServer
      .from("visit_documentation_fields")
      .insert([
        {
          business_id: context.business_id,
          field_name: validated.field_name,
          field_type: validated.field_type,
          is_required: validated.is_required || false,
          field_order: nextOrder,
          dropdown_options: validated.dropdown_options || null,
        },
      ])
      .select()
      .single();

    if (error) {
      throw Errors.DATABASE_ERROR(error.message);
    }

    return successResponse(field, 201);
  } catch (error) {
    if (error instanceof Error && error.message.includes("validation")) {
      return errorResponse(Errors.VALIDATION_ERROR(error.message));
    }
    return errorResponse(error);
  }
}
