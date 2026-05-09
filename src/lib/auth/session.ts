import { cookies } from "next/headers";

/**
 * Session management utilities for httpOnly cookies
 * JWT tokens are stored as httpOnly cookies for security
 */

const COOKIE_NAME = "auth_token";
const BUSINESS_COOKIE_NAME = "business_id";

/**
 * Set JWT token as httpOnly cookie
 * httpOnly: Can't be accessed by JavaScript (prevents XSS attacks)
 * secure: Only sent over HTTPS in production
 * sameSite: Prevents CSRF attacks
 */
export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 24 * 60 * 60, // 24 hours
    path: "/",
  });
}

/**
 * Set business_id in cookie
 * This tracks which business the user selected
 */
export async function setBusinessCookie(businessId: string): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(BUSINESS_COOKIE_NAME, businessId, {
    httpOnly: false, // Needed for client-side context
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 24 * 60 * 60,
    path: "/",
  });
}

/**
 * Get JWT token from cookie
 */
export async function getAuthCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value;
}

/**
 * Get business_id from cookie
 */
export async function getBusinessCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(BUSINESS_COOKIE_NAME)?.value;
}

/**
 * Clear auth cookies (logout)
 */
export async function clearAuthCookies(): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0, // Delete cookie
    path: "/",
  });

  cookieStore.set(BUSINESS_COOKIE_NAME, "", {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0, // Delete cookie
    path: "/",
  });
}
