import { NextRequest } from "next/server";
import { Errors } from "./errors";

/**
 * Middleware helpers for API routes
 * Extract and validate JWT claims from requests
 */

export interface RequestContext {
  user_id: string;
  business_id: string;
  role: "admin" | "doctor" | "receptionist";
  email: string;
}

/**
 * Extract user context from request
 * Called in API routes to validate JWT and get business context
 *
 * IMPORTANT: JWT verification happens in src/middleware.ts (Edge Runtime)
 * By the time we reach an API route, the token is already verified
 * This function extracts the payload for use in the route
 */
export function extractUserContext(request: NextRequest): RequestContext {
  // Get JWT from Authorization header (set by middleware)
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    throw Errors.MISSING_CREDENTIALS();
  }

  // Extract payload from X-User-* headers (set by middleware after JWT verification)
  const user_id = request.headers.get("x-user-id");
  const email = request.headers.get("x-user-email");
  const business_id = request.headers.get("x-business-id");
  const role = request.headers.get("x-user-role") as
    | "admin"
    | "doctor"
    | "receptionist";

  if (!user_id || !email || !business_id || !role) {
    throw Errors.INVALID_JWT();
  }

  return {
    user_id,
    email,
    business_id,
    role,
  };
}

/**
 * Validate user has required role(s)
 * Usage: validateRole(context, ['admin', 'doctor'])
 */
export function validateRole(
  context: RequestContext,
  allowedRoles: string[]
): void {
  if (!allowedRoles.includes(context.role)) {
    throw Errors.FORBIDDEN(
      `This action requires one of these roles: ${allowedRoles.join(", ")}`
    );
  }
}

/**
 * Validate business_id from request matches user's context
 * Prevents accidental/intentional access to other businesses
 */
export function validateBusinessMatch(
  context: RequestContext,
  requestedBusinessId?: string
): void {
  if (requestedBusinessId && requestedBusinessId !== context.business_id) {
    throw Errors.INVALID_BUSINESS();
  }
}

/**
 * Get JWT payload from headers (already verified by middleware)
 * Used to extract custom claims if needed
 */
export function getJWTPayload(request: NextRequest): Record<string, unknown> {
  // Middleware sets individual headers, but we could also extract the full JWT
  return {
    user_id: request.headers.get("x-user-id"),
    email: request.headers.get("x-user-email"),
    business_id: request.headers.get("x-business-id"),
    role: request.headers.get("x-user-role"),
  };
}
