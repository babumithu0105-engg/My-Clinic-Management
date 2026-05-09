import { NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { extractUserContext, validateRole } from "@/lib/api/middleware-helpers";
import { Errors, errorResponse, successResponse } from "@/lib/api/errors";
import { UpdateWorkingHoursSchema } from "@/lib/validations/admin";
import type { WorkingHours } from "@/types";

// GET /api/admin/working-hours
export async function GET(request: NextRequest) {
  try {
    const context = extractUserContext(request);
    validateRole(context, ["admin"]);

    const { data: workingHours, error } = await supabaseServer
      .from("working_hours")
      .select("*")
      .eq("business_id", context.business_id)
      .order("day_of_week", { ascending: true });

    if (error) {
      throw Errors.DATABASE_ERROR(error.message);
    }

    // Return all 7 days (fill missing days with defaults)
    const dayMap: Record<number, WorkingHours> = {};
    (workingHours as any[]).forEach((wh) => {
      dayMap[wh.day_of_week] = wh;
    });

    const allDays: WorkingHours[] = [];
    for (let day = 0; day < 7; day++) {
      allDays.push(
        dayMap[day] || {
          day_of_week: day,
          is_open: true,
          start_time: "09:00",
          end_time: "18:00",
        }
      );
    }

    return successResponse({ working_hours: allDays });
  } catch (error) {
    return errorResponse(error);
  }
}

// PUT /api/admin/working-hours
export async function PUT(request: NextRequest) {
  try {
    const context = extractUserContext(request);
    validateRole(context, ["admin"]);

    const body = await request.json();
    const validated = UpdateWorkingHoursSchema.parse(body);

    // Prepare upsert data: add business_id and updated_at to each record
    const upsertData = validated.map((day) => ({
      business_id: context.business_id,
      day_of_week: day.day_of_week,
      is_open: day.is_open,
      start_time: day.is_open ? day.start_time : null,
      end_time: day.is_open ? day.end_time : null,
      updated_at: new Date().toISOString(),
    }));

    // Upsert all 7 days
    const { data: updated, error } = await supabaseServer
      .from("working_hours")
      .upsert(upsertData, { onConflict: "business_id,day_of_week" })
      .select()
      .order("day_of_week", { ascending: true });

    if (error) {
      throw Errors.DATABASE_ERROR(error.message);
    }

    return successResponse({ working_hours: updated });
  } catch (error) {
    if (error instanceof Error && error.message.includes("validation")) {
      return errorResponse(Errors.VALIDATION_ERROR(error.message));
    }
    return errorResponse(error);
  }
}
