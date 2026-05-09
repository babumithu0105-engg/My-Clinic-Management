import { NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { extractUserContext, validateRole } from "@/lib/api/middleware-helpers";
import { Errors, errorResponse, successResponse } from "@/lib/api/errors";
import { CreateAppointmentSchema } from "@/lib/validations/appointment";
import type { AppointmentWithPatient } from "@/types";

// GET /api/appointments?date=YYYY-MM-DD
// List all appointments for a specific date
export async function GET(request: NextRequest) {
  try {
    const context = extractUserContext(request);
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");

    if (!date) {
      return errorResponse(Errors.BAD_REQUEST("date parameter is required"));
    }

    const { data, error } = await supabaseServer
      .from("appointments")
      .select("*, patient:patients(id, name, phone_number, age, sex)")
      .eq("business_id", context.business_id)
      .eq("appointment_date", date)
      .neq("status", "cancelled")
      .order("appointment_time", { ascending: true });

    if (error) {
      throw Errors.DATABASE_ERROR(error.message);
    }

    return successResponse({
      data: data as AppointmentWithPatient[],
    });
  } catch (error) {
    return errorResponse(error);
  }
}

// POST /api/appointments
// Create a new appointment (receptionist/admin only)
export async function POST(request: NextRequest) {
  try {
    const context = extractUserContext(request);
    validateRole(context, ["receptionist", "admin"]);

    const body = await request.json();
    const validated = CreateAppointmentSchema.parse(body);

    // Verify patient exists and belongs to this business
    const { data: patient, error: patientError } = await supabaseServer
      .from("patients")
      .select("id")
      .eq("id", validated.patient_id)
      .eq("business_id", context.business_id)
      .maybeSingle();

    if (patientError) {
      throw Errors.DATABASE_ERROR(patientError.message);
    }

    if (!patient) {
      return errorResponse(Errors.NOT_FOUND("Patient not found or does not belong to your business"));
    }

    // For walk-ins, use current time if not provided
    const appointmentTime = validated.appointment_time ||
      new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });

    // Insert appointment
    const { data: appointment, error: insertError } = await supabaseServer
      .from("appointments")
      .insert([
        {
          business_id: context.business_id,
          patient_id: validated.patient_id,
          appointment_date: validated.appointment_date,
          appointment_time: appointmentTime,
          duration_minutes: validated.duration_minutes,
          status: "scheduled",
          is_walk_in: validated.is_walk_in || false,
          receptionist_notes: validated.receptionist_notes || null,
        },
      ])
      .select("*, patient:patients(id, name, phone_number, age, sex)")
      .single();

    if (insertError) {
      throw Errors.DATABASE_ERROR(insertError.message);
    }

    return successResponse(appointment as AppointmentWithPatient, 201);
  } catch (error) {
    if (error instanceof Error && error.message.includes("validation")) {
      return errorResponse(Errors.VALIDATION_ERROR(error.message));
    }
    return errorResponse(error);
  }
}
