import { NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { extractUserContext, validateRole } from "@/lib/api/middleware-helpers";
import { Errors, errorResponse, successResponse } from "@/lib/api/errors";
import { CreatePatientSchema } from "@/lib/validations/patient";
import type { Patient } from "@/types";

// GET /api/patients?search=<query>&skip=0&limit=10
// List all patients or search by name/phone within business
export async function GET(request: NextRequest) {
  try {
    const context = extractUserContext(request);
    const { searchParams } = new URL(request.url);
    const searchQuery = searchParams.get("search");
    const skip = parseInt(searchParams.get("skip") || "0");
    const limit = parseInt(searchParams.get("limit") || "10");

    let query = supabaseServer
      .from("patients")
      .select("*", { count: "exact" })
      .eq("business_id", context.business_id)
      .order("name", { ascending: true });

    if (searchQuery) {
      query = query.or(
        `name.ilike.%${searchQuery}%,phone_number.ilike.%${searchQuery}%`
      );
    }

    const { data, error, count } = await query.range(skip, skip + limit - 1);

    if (error) {
      throw Errors.DATABASE_ERROR(error.message);
    }

    return successResponse({
      data: data as Patient[],
      total: count || 0,
      skip,
      limit,
    });
  } catch (error) {
    return errorResponse(error);
  }
}

// POST /api/patients
// Create a new patient (receptionist only)
export async function POST(request: NextRequest) {
  try {
    const context = extractUserContext(request);
    validateRole(context, ["receptionist", "admin"]);

    const body = await request.json();
    const validated = CreatePatientSchema.parse(body);

    const { data, error } = await supabaseServer
      .from("patients")
      .insert([
        {
          business_id: context.business_id,
          name: validated.name,
          phone_number: validated.phone_number,
          age: validated.age ?? null,
          sex: validated.sex ?? null,
          address: validated.address ?? null,
        },
      ])
      .select()
      .single();

    if (error) {
      throw Errors.DATABASE_ERROR(error.message);
    }

    return successResponse(data as Patient, 201);
  } catch (error) {
    if (error instanceof Error && error.message.includes("validation")) {
      return errorResponse(
        Errors.VALIDATION_ERROR(error.message)
      );
    }
    return errorResponse(error);
  }
}
