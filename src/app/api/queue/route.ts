import { NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { extractUserContext } from "@/lib/api/middleware-helpers";
import { Errors, errorResponse, successResponse } from "@/lib/api/errors";
import type { QueueResponse, AppointmentWithPatient } from "@/types";
import { format } from "date-fns";

// GET /api/queue?date=YYYY-MM-DD
// Get today's queue (or specified date), split into booked + walk-ins
export async function GET(request: NextRequest) {
  try {
    const context = extractUserContext(request);
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date") || format(new Date(), "yyyy-MM-dd");

    // Fetch all non-cancelled, non-completed appointments for this date
    const { data: appointments, error } = await supabaseServer
      .from("appointments")
      .select("*, patient:patients(id, name, phone_number, age, sex)")
      .eq("business_id", context.business_id)
      .eq("appointment_date", date)
      .not("status", "in", "(cancelled,completed)")
      .order("appointment_time", { ascending: true });

    if (error) {
      throw Errors.DATABASE_ERROR(error.message);
    }

    // Split into booked and walk-ins
    const booked: AppointmentWithPatient[] = [];
    const walk_ins: AppointmentWithPatient[] = [];

    (appointments || []).forEach((apt) => {
      if (apt.is_walk_in) {
        walk_ins.push(apt as AppointmentWithPatient);
      } else {
        booked.push(apt as AppointmentWithPatient);
      }
    });

    const result: QueueResponse = {
      booked,
      walk_ins,
    };

    return successResponse({ data: result });
  } catch (error) {
    return errorResponse(error);
  }
}
