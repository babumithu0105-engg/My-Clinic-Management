import { NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { extractUserContext, validateRole } from "@/lib/api/middleware-helpers";
import { Errors, errorResponse, successResponse } from "@/lib/api/errors";
import type { AppointmentWithPatient } from "@/types";

// GET /api/appointments/history?tab=past|future&dateRange=week|month|3months|6months|year&search=query&patientId=optional
export async function GET(request: NextRequest) {
  try {
    const context = extractUserContext(request);
    validateRole(context, ["receptionist", "admin"]);

    const { searchParams } = new URL(request.url);
    const tab = searchParams.get("tab") as "past" | "future" | null;
    const dateRange = (searchParams.get("dateRange") || "month") as
      | "week"
      | "month"
      | "3months"
      | "6months"
      | "year";
    const search = searchParams.get("search") || "";
    const patientId = searchParams.get("patientId") || "";

    // Calculate date range
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    if (tab === "past") {
      // Past: from date range start to today
      endDate = new Date(now);
      endDate.setHours(23, 59, 59, 999);

      startDate = new Date(now);
      switch (dateRange) {
        case "week":
          startDate.setDate(startDate.getDate() - 7);
          break;
        case "month":
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case "3months":
          startDate.setMonth(startDate.getMonth() - 3);
          break;
        case "6months":
          startDate.setMonth(startDate.getMonth() - 6);
          break;
        case "year":
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
      }
      startDate.setHours(0, 0, 0, 0);
    } else {
      // Future: from today to date range end
      startDate = new Date(now);
      startDate.setHours(0, 0, 0, 0);

      endDate = new Date(now);
      switch (dateRange) {
        case "week":
          endDate.setDate(endDate.getDate() + 7);
          break;
        case "month":
          endDate.setMonth(endDate.getMonth() + 1);
          break;
        case "3months":
          endDate.setMonth(endDate.getMonth() + 3);
          break;
        case "6months":
          endDate.setMonth(endDate.getMonth() + 6);
          break;
        case "year":
          endDate.setFullYear(endDate.getFullYear() + 1);
          break;
      }
      endDate.setHours(23, 59, 59, 999);
    }

    const startDateStr = startDate.toISOString().split("T")[0];
    const endDateStr = endDate.toISOString().split("T")[0];

    // Build query
    let query = supabaseServer
      .from("appointments")
      .select(
        `*,
         patient:patients(id, name, phone_number, age, sex),
         visit:visits(id)`
      )
      .eq("business_id", context.business_id)
      .gte("appointment_date", startDateStr)
      .lte("appointment_date", endDateStr);

    // Apply patient filter if specified
    if (patientId) {
      query = query.eq("patient_id", patientId);
    }

    // Apply status filter based on tab
    if (tab === "past") {
      query = query.in("status", ["completed", "cancelled", "no-show"]);
    } else if (tab === "future") {
      query = query.in("status", ["scheduled", "checked-in"]);
    }
    // If no tab, fetch all appointments

    query = query.order("appointment_date", { ascending: false });

    const { data, error } = await query;

    if (error) {
      throw Errors.DATABASE_ERROR(error.message);
    }

    // Filter by search query (client-side for flexibility)
    let filtered = (data || []) as AppointmentWithPatient[];
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (apt) =>
          apt.patient?.name?.toLowerCase().includes(searchLower) ||
          apt.patient?.phone_number?.includes(search)
      );
    }

    return successResponse({
      data: filtered,
      total: filtered.length,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
