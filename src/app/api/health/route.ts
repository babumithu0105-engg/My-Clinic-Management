import { NextResponse } from "next/server";
import type { HealthCheckResponse } from "@/types";
import { supabaseServer } from "@/lib/supabase/server";

/**
 * Health check endpoint
 * Tests database connection and returns system status
 * Useful for verifying Supabase setup during development
 */

export async function GET() {
  const timestamp = new Date().toISOString();

  try {
    // Test database connection by querying the businesses table
    const { error } = await supabaseServer
      .from("businesses")
      .select("id")
      .limit(1);

    if (error) {
      return NextResponse.json(
        {
          status: "error",
          message: `Database connection failed: ${error.message}`,
          database_connection: false,
          timestamp,
        } as HealthCheckResponse,
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        status: "ok",
        message: "System is healthy - database connection successful",
        database_connection: true,
        timestamp,
      } as HealthCheckResponse,
      { status: 200 }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";

    return NextResponse.json(
      {
        status: "error",
        message: `Health check failed: ${message}`,
        database_connection: false,
        timestamp,
      } as HealthCheckResponse,
      { status: 500 }
    );
  }
}
