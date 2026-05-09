import { NextRequest, NextResponse } from "next/server";
import { verifyJWT, extractBearerToken } from "@/lib/auth/jwt";

/**
 * Next.js Middleware - Runs on Edge Runtime before reaching API routes
 * Validates JWT tokens on all protected routes
 * This is the primary security layer for the application
 */

// Routes that don't require authentication
const PUBLIC_ROUTES = ["/", "/login", "/select-business"];

// Routes that require authentication
const PROTECTED_ROUTES = [
  "/(app)",
  "/api/auth/logout",
  "/api/auth/me",
  "/api/patients",
  "/api/appointments",
  "/api/visits",
  "/api/queue",
  "/api/config",
  "/api/users",
];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Allow public routes without authentication
  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check if this is a protected route
  const isProtected = PROTECTED_ROUTES.some(
    (route) =>
      pathname.startsWith(route) ||
      pathname.match(new RegExp(`^${route.replace("/(app)", "/(app)")}`))
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  // Extract JWT from Authorization header
  const authHeader = request.headers.get("authorization");

  if (!authHeader) {
    // No token provided - redirect to login
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    // Extract and verify JWT
    const token = extractBearerToken(authHeader);
    const payload = await verifyJWT(token);

    // Create a new response with user context in headers
    // These headers are accessible in API routes via request.headers
    const response = NextResponse.next();
    response.headers.set("x-user-id", payload.sub);
    response.headers.set("x-user-email", payload.email);
    response.headers.set("x-user-name", payload.name);

    // Business context: Extract from request or use first business
    const businessId =
      request.headers.get("x-business-id") ||
      payload.business_ids?.[0]?.id ||
      "";
    const role = payload.business_ids?.find((b) => b.id === businessId)?.role || "";

    if (businessId) {
      response.headers.set("x-business-id", businessId);
      response.headers.set("x-user-role", role);
    }

    return response;
  } catch (error) {
    // Invalid or expired token - redirect to login
    const loginUrl = new URL("/login", request.url);
    const response = NextResponse.redirect(loginUrl);

    // Clear the invalid token
    response.cookies.delete("auth_token");

    return response;
  }
}

/**
 * Configure which routes use middleware
 * Use route groups to avoid applying middleware to public routes unnecessarily
 */
export const config = {
  matcher: [
    // Protect all app routes
    "/(app)/:path*",
    // Protect specific API routes
    "/api/patients/:path*",
    "/api/appointments/:path*",
    "/api/visits/:path*",
    "/api/queue/:path*",
    "/api/config/:path*",
    "/api/users/:path*",
    "/api/auth/logout",
    "/api/auth/me",
    // Protect select-business
    "/select-business/:path*",
  ],
};
