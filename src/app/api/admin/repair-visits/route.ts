import { NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { extractUserContext, validateRole } from "@/lib/api/middleware-helpers";
import { Errors, errorResponse, successResponse } from "@/lib/api/errors";

// POST /api/admin/repair-visits
// Find orphaned visits (visits without corresponding appointment records) and recreate the appointments
export async function POST(request: NextRequest) {
  try {
    const context = extractUserContext(request);
    validateRole(context, ["admin"]);

    // Find all visits in this business
    const { data: allVisits, error: visitsError } = await supabaseServer
      .from("visits")
      .select("*, appointments(id)")
      .eq("business_id", context.business_id);

    if (visitsError) {
      throw Errors.DATABASE_ERROR(visitsError.message);
    }

    // Find orphaned visits (ones without corresponding appointments)
    const orphanedVisits = (allVisits || []).filter((visit: any) => !visit.appointments);

    if (orphanedVisits.length === 0) {
      return successResponse({
        message: "No orphaned visits found",
        repaired: 0,
      });
    }

    // Recreate missing appointments for orphaned visits
    const appointmentsToCreate = orphanedVisits.map((visit: any) => ({
      id: visit.appointment_id,
      business_id: context.business_id,
      patient_id: visit.patient_id,
      appointment_date: visit.created_at?.split("T")[0] || new Date().toISOString().split("T")[0],
      appointment_time: "00:00",
      duration_minutes: 30,
      status: "completed",
      created_at: visit.created_at,
      updated_at: visit.updated_at,
    }));

    if (appointmentsToCreate.length > 0) {
      const { error: insertError } = await supabaseServer
        .from("appointments")
        .insert(appointmentsToCreate);

      if (insertError) {
        // If it fails due to duplicate key, that's okay - the appointment might exist now
        if (!insertError.message.includes("duplicate")) {
          throw Errors.DATABASE_ERROR(insertError.message);
        }
      }
    }

    return successResponse({
      message: `Repaired ${orphanedVisits.length} orphaned visits`,
      repaired: orphanedVisits.length,
      visits: orphanedVisits.map((v: any) => ({
        visitId: v.id,
        appointmentId: v.appointment_id,
        patientId: v.patient_id,
      })),
    });
  } catch (error) {
    return errorResponse(error);
  }
}
