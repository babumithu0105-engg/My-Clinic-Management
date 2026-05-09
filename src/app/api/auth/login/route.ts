import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { verifyPassword } from "@/lib/auth/password";
import { signJWT } from "@/lib/auth/jwt";
import { setAuthCookie } from "@/lib/auth/session";
import { Errors, errorResponse } from "@/lib/api/errors";
import { isValidEmail } from "@/lib/utils";

/**
 * POST /api/auth/login
 * Authenticate user with email and password
 * Returns JWT token and user info
 */

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  user: {
    id: string;
    email: string;
    name: string;
  };
  business_ids: Array<{ id: string; role: string }>;
  token: string;
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    let body: LoginRequest;
    try {
      body = await request.json();
    } catch {
      throw Errors.BAD_REQUEST("Invalid JSON in request body");
    }

    // Validate input
    const { email, password } = body;

    if (!email || !isValidEmail(email)) {
      throw Errors.BAD_REQUEST("Valid email is required");
    }

    if (!password || password.length < 1) {
      throw Errors.BAD_REQUEST("Password is required");
    }

    // Query user from database
    const { data: users, error: userError } = await supabaseServer
      .from("users")
      .select("id, email, password_hash, name")
      .eq("email", email.toLowerCase())
      .single();

    if (userError || !users) {
      // Don't reveal if user exists or not (security best practice)
      throw Errors.BAD_REQUEST("Invalid email or password");
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, users.password_hash);
    if (!isPasswordValid) {
      throw Errors.BAD_REQUEST("Invalid email or password");
    }

    // Get user's business memberships
    const { data: memberships, error: membershipError } = await supabaseServer
      .from("business_users")
      .select("business_id, role")
      .eq("user_id", users.id);

    if (membershipError || !memberships || memberships.length === 0) {
      throw Errors.FORBIDDEN(
        "User does not belong to any business. Contact administrator."
      );
    }

    // Prepare business_ids array for JWT
    const business_ids = memberships.map((m) => ({
      id: m.business_id,
      role: m.role,
    }));

    // Sign JWT token
    const token = await signJWT({
      sub: users.id,
      email: users.email,
      name: users.name,
      business_ids,
    });

    // Set auth cookie
    await setAuthCookie(token);

    // Return success response
    const response: LoginResponse = {
      user: {
        id: users.id,
        email: users.email,
        name: users.name,
      },
      business_ids,
      token,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Login error:", error);
    return errorResponse(error);
  }
}
