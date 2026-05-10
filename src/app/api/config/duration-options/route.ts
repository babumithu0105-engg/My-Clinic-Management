import { NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { extractUserContext } from "@/lib/api/middleware-helpers";
import { Errors, errorResponse, successResponse } from "@/lib/api/errors";

const DEFAULT_DURATION_OPTIONS = ["15", "30", "45"];

// GET /api/config/duration-options
// Get appointment duration options for this business
export async function GET(request: NextRequest) {
  try {
    const context = extractUserContext(request);

    const { data: config, error } = await supabaseServer
      .from("business_config")
      .select("appointment_duration_options")
      .eq("business_id", context.business_id)
      .maybeSingle();

    if (error) {
      throw Errors.DATABASE_ERROR(error.message);
    }

    const options = config?.appointment_duration_options || DEFAULT_DURATION_OPTIONS;

    return successResponse({ options });
  } catch (error) {
    return errorResponse(error);
  }
}
