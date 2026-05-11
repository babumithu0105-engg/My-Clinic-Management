import { NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { extractUserContext, validateRole } from "@/lib/api/middleware-helpers";
import { Errors, errorResponse, successResponse } from "@/lib/api/errors";
import { UpdatePatientSchema } from "@/lib/validations/patient";
import type { Patient, AppointmentWithPatient } from "@/types";

interface PatientWithAppointments extends Patient {
  appointments?: AppointmentWithPatient[];
}

// GET /api/patients/[id]
// Get patient details with last 3 appointments
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const context = extractUserContext(request);
    const { id } = params;

    // Get patient
    const { data: patient, error: patientError } = await supabaseServer
      .from("patients")
      .select("*")
      .eq("id", id)
      .eq("business_id", context.business_id)
      .single();

    if (patientError || !patient) {
      throw Errors.NOT_FOUND("Patient");
    }

    // Get last 3 appointments
    const { data: appointments, error: appointmentError } = await supabaseServer
      .from("appointments")
      .select("*")
      .eq("patient_id", id)
      .eq("business_id", context.business_id)
      .order("appointment_date", { ascending: false })
      .limit(3);

    if (appointmentError) {
      throw Errors.DATABASE_ERROR(appointmentError.message);
    }

    const result: PatientWithAppointments = {
      ...patient,
      appointments: appointments as AppointmentWithPatient[],
    };

    return successResponse({ data: result });
  } catch (error) {
    return errorResponse(error);
  }
}

// PUT /api/patients/[id]
// Update patient (receptionist only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const context = extractUserContext(request);
    validateRole(context, ["receptionist", "admin"]);

    const { id } = params;

    // Verify patient exists and belongs to business
    const { data: existingPatient, error: getError } = await supabaseServer
      .from("patients")
      .select("*")
      .eq("id", id)
      .eq("business_id", context.business_id)
      .single();

    if (getError || !existingPatient) {
      throw Errors.NOT_FOUND("Patient");
    }

    // Validate and update
    const body = await request.json();
    const validated = UpdatePatientSchema.parse(body);

    const updatePayload: Record<string, any> = {};
    if (validated.name !== undefined) updatePayload.name = validated.name;
    if (validated.phone_number !== undefined)
      updatePayload.phone_number = validated.phone_number;
    if (validated.age !== undefined) updatePayload.age = validated.age;
    if (validated.sex !== undefined) updatePayload.sex = validated.sex;
    if (validated.address !== undefined)
      updatePayload.address = validated.address;
    if (validated.status !== undefined) updatePayload.status = validated.status;

    const { data, error } = await supabaseServer
      .from("patients")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw Errors.DATABASE_ERROR(error.message);
    }

    return successResponse({ data: data as Patient });
  } catch (error) {
    if (error instanceof Error && error.message.includes("validation")) {
      return errorResponse(Errors.VALIDATION_ERROR(error.message));
    }
    return errorResponse(error);
  }
}
