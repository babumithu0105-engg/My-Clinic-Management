import { NextRequest, NextResponse } from "next/server";
import { verifyJWT, extractBearerToken } from "@/lib/auth/jwt";

/**
 * Next.js Middleware - Runs on Edge Runtime before reaching API routes
 * Validates JWT tokens on all protected routes
 * This is the primary security layer for the application
 */

// Routes that don't require authentication
const PUBLIC_ROUTES = ["/login", "/select-business", "/api/auth/login", "/api/health", "/dev-preview"];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Allow public routes without authentication
  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Root "/" goes to login
  if (pathname === "/") {
    return NextResponse.next();
  }

  // At this point, middleware only runs on protected routes (defined in config.matcher below)
  // Extract JWT from Authorization header OR httpOnly cookie
  let token: string | null = null;

  const authHeader = request.headers.get("authorization");
  if (authHeader) {
    token = extractBearerToken(authHeader);
  } else {
    // Fall back to httpOnly cookie (set by setAuthCookie on login)
    token = request.cookies.get("auth_token")?.value || null;
  }

  if (!token) {
    // No token provided - redirect to login
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    // Extract and verify JWT
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
    // Protect dashboard routes (receptionist, doctor, admin)
    "/receptionist/:path*",
    "/doctor/:path*",
    "/admin/:path*",
    // Protect specific API routes
    "/api/patients/:path*",
    "/api/appointments/:path*",
    "/api/visits/:path*",
    "/api/queue/:path*",
    "/api/admin/:path*",
    "/api/config/:path*",
    "/api/users/:path*",
    "/api/auth/logout",
    "/api/auth/me",
    // Protect select-business
    "/select-business/:path*",
  ],
};
