import { SignJWT, jwtVerify } from "jose";
import type { JWTPayload } from "@/types";

/**
 * JWT token utilities using jose (Edge Runtime compatible)
 * Uses jose instead of jsonwebtoken because it works in Edge Runtime
 * (required for Next.js middleware)
 */

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

/**
 * Sign a new JWT token
 */
export async function signJWT(payload: Omit<JWTPayload, "iat" | "exp">) {
  const expiresIn = process.env.JWT_EXPIRES_IN || "24h";

  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secret);

  return token;
}

/**
 * Verify and decode a JWT token
 * Returns the payload if valid, throws if invalid/expired
 */
export async function verifyJWT(token: string): Promise<JWTPayload> {
  try {
    const verified = await jwtVerify(token, secret);
    return verified.payload as unknown as JWTPayload;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Token verification failed";
    throw new Error(`Invalid token: ${message}`);
  }
}

/**
 * Extract JWT from Authorization header
 * Format: "Bearer <token>"
 */
export function extractBearerToken(authHeader: string | null): string {
  if (!authHeader) {
    throw new Error("Missing Authorization header");
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    throw new Error("Invalid Authorization header format");
  }

  return parts[1];
}

/**
 * Decode JWT without verifying signature
 * Use only for debugging or when you trust the source
 */
export function decodeJWT(token: string): JWTPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const payload = JSON.parse(
      Buffer.from(parts[1], "base64").toString("utf-8")
    );
    return payload as JWTPayload;
  } catch {
    return null;
  }
}
