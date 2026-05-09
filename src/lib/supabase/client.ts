import { createClient } from "@supabase/supabase-js";
// TODO: Uncomment after running: supabase gen types typescript > src/types/database.ts
// import type { Database } from "@/types/database";
type Database = any;

/**
 * Supabase browser client using ANON KEY
 * This key is exposed to the browser (NEXT_PUBLIC_ prefix)
 *
 * CRITICAL: Do NOT use this for data queries
 * RLS is configured to deny all anon access as defense-in-depth
 *
 * Allowed uses:
 * - Realtime Broadcast subscriptions (queue updates, etc.)
 * - Authentication state (if using Supabase Auth - not used in Phase 1)
 *
 * All data access must go through Next.js API routes which use the service role client
 */

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL environment variable is not set");
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable is not set");
}

export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
    },
  }
);
