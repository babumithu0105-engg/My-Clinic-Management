import { NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { extractUserContext } from "@/lib/api/middleware-helpers";
import { Errors, errorResponse, successResponse } from "@/lib/api/errors";

interface VisitHistory {
  id: string;
  appointment_date: string;
  appointment_time: string;
  check_in_time?: string;
  completion_time?: string;
  receptionist_notes?: string;
  free_text_notes?: string;
  duration_minutes: number;
  status: string;
}

// GET /api/patients/[id]/history
// Get visit history for a patient
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const context = extractUserContext(request);
    const { id: patientId } = params;

    // Verify patient belongs to this business
    const { data: patient, error: patientError } = await supabaseServer
      .from("patients")
      .select("id")
      .eq("id", patientId)
      .eq("business_id", context.business_id)
      .single();

    if (patientError || !patient) {
      return errorResponse(Errors.NOT_FOUND("Patient not found or does not belong to your business"));
    }

    // Fetch visits with appointments
    const { data: visits, error: visitsError } = await supabaseServer
      .from("visits")
      .select(
        `
        id,
        check_in_time,
        completion_time,
        free_text_notes,
        created_at,
        updated_at,
        appointment:appointments(
          id,
          appointment_date,
          appointment_time,
          duration_minutes,
          status,
          receptionist_notes
        )
      `
      )
      .eq("business_id", context.business_id)
      .eq("appointment.patient_id", patientId)
      .order("appointment_date", { ascending: false })
      .limit(20);

    if (visitsError) {
      throw Errors.DATABASE_ERROR(visitsError.message);
    }

    // Transform to history format
    const history: VisitHistory[] = (visits || []).map((visit: any) => ({
      id: visit.id,
      appointment_date: visit.appointment?.appointment_date || "",
      appointment_time: visit.appointment?.appointment_time || "",
      check_in_time: visit.check_in_time,
      completion_time: visit.completion_time,
      receptionist_notes: visit.appointment?.receptionist_notes,
      free_text_notes: visit.free_text_notes,
      duration_minutes: visit.appointment?.duration_minutes || 0,
      status: visit.appointment?.status || "unknown",
    }));

    return successResponse(history);
  } catch (error) {
    return errorResponse(error);
  }
}
