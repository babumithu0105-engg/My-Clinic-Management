import { NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { extractUserContext, validateRole } from "@/lib/api/middleware-helpers";
import { Errors, errorResponse, successResponse } from "@/lib/api/errors";
import { CreateHolidaySchema } from "@/lib/validations/admin";

// GET /api/admin/holidays
export async function GET(request: NextRequest) {
  try {
    const context = extractUserContext(request);
    validateRole(context, ["admin"]);

    const { data: holidays, error } = await supabaseServer
      .from("holidays")
      .select("*")
      .eq("business_id", context.business_id)
      .order("holiday_date", { ascending: true });

    if (error) {
      throw Errors.DATABASE_ERROR(error.message);
    }

    return successResponse({ holidays });
  } catch (error) {
    return errorResponse(error);
  }
}

// POST /api/admin/holidays
export async function POST(request: NextRequest) {
  try {
    const context = extractUserContext(request);
    validateRole(context, ["admin"]);

    const body = await request.json();
    const validated = CreateHolidaySchema.parse(body);

    const { data: holiday, error } = await supabaseServer
      .from("holidays")
      .insert([
        {
          business_id: context.business_id,
          holiday_date: validated.holiday_date,
          reason: validated.reason || null,
        },
      ])
      .select()
      .single();

    if (error) {
      // Check for UNIQUE constraint violation (error code 23505)
      if (error.code === "23505") {
        return errorResponse(
          Errors.CONFLICT(`Holiday already exists for ${validated.holiday_date}`)
        );
      }
      throw Errors.DATABASE_ERROR(error.message);
    }

    return successResponse(holiday, 201);
  } catch (error) {
    if (error instanceof Error && error.message.includes("validation")) {
      return errorResponse(Errors.VALIDATION_ERROR(error.message));
    }
    return errorResponse(error);
  }
}
