import { NextResponse } from "next/server";
import type { APIError } from "@/types";

/**
 * Standard API error responses
 * All errors should use these to maintain consistency
 */

export class APIException extends Error {
  constructor(
    public code: string,
    public message: string,
    public status: number = 400
  ) {
    super(message);
    this.name = "APIException";
  }
}

/**
 * Common error responses
 */

export const Errors = {
  UNAUTHORIZED: (message = "Unauthorized") =>
    new APIException("UNAUTHORIZED", message, 401),

  FORBIDDEN: (message = "Forbidden - insufficient permissions") =>
    new APIException("FORBIDDEN", message, 403),

  NOT_FOUND: (resource: string) =>
    new APIException("NOT_FOUND", `${resource} not found`, 404),

  BAD_REQUEST: (message: string) =>
    new APIException("BAD_REQUEST", message, 400),

  CONFLICT: (message: string) =>
    new APIException("CONFLICT", message, 409),

  VALIDATION_ERROR: (message: string) =>
    new APIException("VALIDATION_ERROR", message, 400),

  INTERNAL_ERROR: (message = "Internal server error") =>
    new APIException("INTERNAL_ERROR", message, 500),

  DATABASE_ERROR: (message: string) =>
    new APIException("DATABASE_ERROR", `Database error: ${message}`, 500),

  INVALID_BUSINESS: () =>
    new APIException(
      "INVALID_BUSINESS",
      "Invalid business ID or user does not belong to this business",
       403
    ),

  MISSING_CREDENTIALS: () =>
    new APIException("MISSING_CREDENTIALS", "Missing required credentials", 401),

  INVALID_JWT: () =>
    new APIException("INVALID_JWT", "Invalid or expired JWT token", 401),
};

/**
 * Error response handler
 * Converts errors to standard JSON responses
 */
export function errorResponse(
  error: unknown,
  defaultStatus = 500
): NextResponse<APIError> {
  let code = "INTERNAL_ERROR";
  let message = "An unexpected error occurred";
  let status = defaultStatus;

  if (error instanceof APIException) {
    code = error.code;
    message = error.message;
    status = error.status;
  } else if (error instanceof Error) {
    message = error.message;
  }

  return NextResponse.json(
    {
      code,
      message,
      status,
    } as APIError,
    { status }
  );
}

/**
 * Success response wrapper
 */
export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}
