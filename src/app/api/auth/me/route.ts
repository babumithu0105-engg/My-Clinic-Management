import { NextRequest, NextResponse } from "next/server";
import { extractUserContext } from "@/lib/api/middleware-helpers";
import { errorResponse } from "@/lib/api/errors";

/**
 * GET /api/auth/me
 * Get current authenticated user's info
 * Requires valid JWT token in Authorization header
 */

interface MeResponse {
  user: {
    id: string;
    email: string;
  };
  business_id: string;
  role: string;
}

export async function GET(request: NextRequest) {
  try {
    // Extract user context from middleware
    const context = extractUserContext(request);

    const response: MeResponse = {
      user: {
        id: context.user_id,
        email: context.email,
      },
      business_id: context.business_id,
      role: context.role,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    return errorResponse(error);
  }
}
