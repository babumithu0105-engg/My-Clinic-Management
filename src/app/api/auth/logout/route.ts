import { NextResponse } from "next/server";
import { clearAuthCookies } from "@/lib/auth/session";

/**
 * POST /api/auth/logout
 * Clear authentication cookies and end session
 */

export async function POST() {
  try {
    // Clear auth cookies
    await clearAuthCookies();

    return NextResponse.json(
      { message: "Logged out successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Logout error:", error);

    return NextResponse.json(
      { message: "An error occurred during logout" },
      { status: 500 }
    );
  }
}
