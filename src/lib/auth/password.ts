import bcrypt from "bcryptjs";

/**
 * Password hashing utilities using bcryptjs
 * Server-side only - never expose hash or password to client
 */

/**
 * Hash a plaintext password
 * IMPORTANT: Only call on server-side (API routes, server components)
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || "12", 10);

  if (saltRounds < 10) {
    console.warn(
      "BCRYPT_SALT_ROUNDS is less than 10 - consider increasing for security"
    );
  }

  try {
    const hash = await bcrypt.hash(password, saltRounds);
    return hash;
  } catch (error) {
    throw new Error(
      `Password hashing failed: ${error instanceof Error ? error.message : "unknown error"}`
    );
  }
}

/**
 * Verify a plaintext password against a hash
 * IMPORTANT: Only call on server-side (API routes)
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  try {
    const isMatch = await bcrypt.compare(password, hash);
    return isMatch;
  } catch (error) {
    throw new Error(
      `Password verification failed: ${error instanceof Error ? error.message : "unknown error"}`
    );
  }
}

/**
 * Validate password strength
 * Returns object with isValid and reasons if invalid
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!password || password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  if (!/[^a-zA-Z0-9]/.test(password)) {
    errors.push("Password must contain at least one special character");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
