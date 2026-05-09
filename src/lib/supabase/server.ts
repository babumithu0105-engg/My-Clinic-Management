import { createClient } from "@supabase/supabase-js";
// TODO: Uncomment after running: supabase gen types typescript > src/types/database.ts
// import type { Database } from "@/types/database";
type Database = any;

/**
 * Supabase server client using SERVICE ROLE KEY
 * CRITICAL: This key must NEVER be exposed to the browser
 * Only use this in:
 * - Next.js API routes (server-side only)
 * - Server components
 * - Middleware
 *
 * This client bypasses RLS - it has full access to all data.
 * All API routes must validate business_id via JWT before using this client.
 */

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY environment variable is not set");
}

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL environment variable is not set");
}

export const supabaseServer = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
