import { NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { extractUserContext } from "@/lib/api/middleware-helpers";
import { Errors, errorResponse, successResponse } from "@/lib/api/errors";
import { generateTimeSlots } from "@/lib/utils";

// Helper: Normalize time to HH:MM format (strips seconds if present)
function normalizeTime(time: string): string {
  return time.split(":").slice(0, 2).join(":");
}

// Helper: Add minutes to time string (HH:MM)
function addMinutesToTime(time: string, minutes: number): string {
  const normalized = normalizeTime(time);
  const [hours, mins] = normalized.split(":").map(Number);
  const totalMins = hours * 60 + mins + minutes;
  const newHours = Math.floor(totalMins / 60);
  const newMins = totalMins % 60;
  return `${String(newHours).padStart(2, "0")}:${String(newMins).padStart(2, "0")}`;
}

// Helper: Check if time windows overlap
// Window 1: [start1, end1], Window 2: [start2, end2]
// Overlap exists if: start1 < end2 AND end1 > start2
function timesOverlap(start1: string, end1: string, start2: string, end2: string): boolean {
  return start1 < end2 && end1 > start2;
}

// GET /api/appointments/available-slots?date=YYYY-MM-DD&duration=30&excludeId=<appointmentId>
export async function GET(request: NextRequest) {
  try {
    const context = extractUserContext(request);
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const durationStr = searchParams.get("duration");
    const excludeId = searchParams.get("excludeId");

    if (!date || !durationStr) {
      return errorResponse(Errors.BAD_REQUEST("date and duration are required"));
    }

    const duration = parseInt(durationStr);
    if (isNaN(duration) || duration <= 0) {
      return errorResponse(Errors.BAD_REQUEST("duration must be a positive number"));
    }

    // Parse date to get day of week (0 = Sunday, 6 = Saturday)
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return errorResponse(Errors.BAD_REQUEST("Invalid date format"));
    }
    const dayOfWeek = dateObj.getUTCDay();

    // Fetch working hours for this day
    const { data: workingHours, error: whError } = await supabaseServer
      .from("working_hours")
      .select("*")
      .eq("business_id", context.business_id)
      .eq("day_of_week", dayOfWeek)
      .maybeSingle();

    if (whError) {
      throw Errors.DATABASE_ERROR(whError.message);
    }

    // If no working hours or clinic is closed, return empty
    if (!workingHours || !workingHours.is_open || !workingHours.start_time || !workingHours.end_time) {
      return successResponse({ slots: [] });
    }

    // Check if date is a holiday
    const { data: holiday, error: holidayError } = await supabaseServer
      .from("holidays")
      .select("id")
      .eq("business_id", context.business_id)
      .eq("holiday_date", date)
      .maybeSingle();

    if (holidayError) {
      throw Errors.DATABASE_ERROR(holidayError.message);
    }

    if (holiday) {
      return successResponse({ slots: [], reason: "holiday" });
    }

    // Fetch doctor unavailability for this date
    const { data: unavailability, error: unavailError } = await supabaseServer
      .from("doctor_unavailability")
      .select("start_time, end_time")
      .eq("business_id", context.business_id)
      .eq("unavailable_date", date);

    if (unavailError) {
      throw Errors.DATABASE_ERROR(unavailError.message);
    }

    // Fetch existing appointments for this date (exclude cancelled status)
    let appointmentsQuery = supabaseServer
      .from("appointments")
      .select("appointment_time, duration_minutes")
      .eq("business_id", context.business_id)
      .eq("appointment_date", date)
      .neq("status", "cancelled");

    // Exclude the appointment being rescheduled
    if (excludeId) {
      appointmentsQuery = appointmentsQuery.neq("id", excludeId);
    }

    const { data: existingAppointments, error: apptError } = await appointmentsQuery;

    if (apptError) {
      throw Errors.DATABASE_ERROR(apptError.message);
    }

    // Normalize working hours times
    const whStart = normalizeTime(workingHours.start_time);
    const whEnd = normalizeTime(workingHours.end_time);

    // Generate all possible slots at 15-minute intervals
    const allSlots = generateTimeSlots(whStart, whEnd, 15);

    // Filter slots: keep only those where the duration window doesn't conflict
    const availableSlots = allSlots.filter((slot) => {
      const slotEnd = addMinutesToTime(slot, duration);

      // Check if slot would run past closing time
      if (slotEnd > whEnd) {
        return false;
      }

      // Check conflict with existing appointments
      for (const appt of existingAppointments) {
        const apptStart = normalizeTime(appt.appointment_time);
        const apptEnd = addMinutesToTime(appt.appointment_time, appt.duration_minutes);
        if (timesOverlap(slot, slotEnd, apptStart, apptEnd)) {
          return false;
        }
      }

      // Check conflict with doctor unavailability
      for (const unavail of unavailability) {
        if (unavail.start_time && unavail.end_time) {
          const unavailStart = normalizeTime(unavail.start_time);
          const unavailEnd = normalizeTime(unavail.end_time);
          if (timesOverlap(slot, slotEnd, unavailStart, unavailEnd)) {
            return false;
          }
        }
      }

      return true;
    });

    return successResponse({ slots: availableSlots });
  } catch (error) {
    return errorResponse(error);
  }
}
