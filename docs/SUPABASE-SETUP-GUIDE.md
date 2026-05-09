# Supabase Setup Guide

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in:
   - **Project Name:** `clinic-app` or similar
   - **Database Password:** Generate a strong password (store securely)
   - **Region:** **India (Mumbai)** — CRITICAL for data residency
5. Click "Create new project"
6. Wait for project to be ready (2-5 minutes)

---

## Step 2: Run Database Migrations

Once your project is ready:

1. Go to **SQL Editor** in the left sidebar
2. Click **"New Query"**
3. Copy the entire content of `docs/supabase-migrations.sql`
4. Paste it into the SQL editor
5. Click **"Run"**
6. Wait for all migrations to complete (should see green checkmarks)

**What this does:**
- Creates all 12 tables (businesses, users, patients, appointments, visits, etc.)
- Creates indexes for performance
- Enables RLS (Row Level Security) on sensitive tables
- Sets up deny-all policies for anon role (defense-in-depth)

---

## Step 3: Get Your Credentials

### Getting NEXT_PUBLIC_SUPABASE_URL

1. Go to **Project Settings** (gear icon bottom left)
2. Click **"API"** tab
3. Copy **"Project URL"**
   - Looks like: `https://your-project.supabase.co`
4. Set in `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   ```

### Getting NEXT_PUBLIC_SUPABASE_ANON_KEY

1. In the same **API** tab
2. Find the **"anon"** key under "Project API keys"
3. Copy it (public key, safe to expose)
4. Set in `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

### Getting SUPABASE_SERVICE_ROLE_KEY

1. In the same **API** tab
2. Find the **"service_role"** key under "Project API keys"
3. Copy it (KEEP THIS SECRET - never commit to git)
4. Set in `.env.local`:
   ```
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

---

## Step 4: Generate TypeScript Database Types

The database schema needs to be converted to TypeScript types for type safety.

### Option A: Using Supabase CLI (Recommended)

1. Install CLI:
   ```bash
   npm install -g supabase
   ```

2. Find your **Project ID** in Project Settings → API → Project URL
   - Extract from URL: `https://YOUR_PROJECT_ID.supabase.co`

3. Run:
   ```bash
   npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.ts
   ```

4. Or add this to `package.json` scripts:
   ```json
   "db:types": "supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.ts"
   ```

Then run:
```bash
npm run db:types
```

### Option B: Manual (if CLI doesn't work)

If you can't use the CLI:

1. Go to **SQL Editor** in Supabase
2. Run this query:
   ```sql
   SELECT json_agg(json_build_object(
     'table_name', table_name,
     'columns', json_agg(json_build_object(
       'column_name', column_name,
       'data_type', data_type,
       'is_nullable', is_nullable
     ))
   )) as schema_definition
   FROM information_schema.columns
   WHERE table_schema = 'public'
   GROUP BY table_name;
   ```
3. Copy the output and generate types manually (or ask Claude to generate from the schema)

---

## Step 5: Update .env.local

Your `.env.local` should now look like:

```env
# Supabase (Client-safe - expose to browser)
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# App Config (Client-safe)
NEXT_PUBLIC_APP_NAME=My Clinic Management
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Server-only (NEVER expose to browser)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# JWT Configuration
JWT_SECRET=your-secret-min-32-chars
JWT_EXPIRES_IN=24h

# Security
BCRYPT_SALT_ROUNDS=12
```

**IMPORTANT:**
- `SUPABASE_SERVICE_ROLE_KEY` must NEVER be committed to git
- `.env.local` is gitignored - it's safe to store secrets there
- Keep backups of these credentials

---

## Step 6: Test the Connection

1. Make sure dev server is running:
   ```bash
   npm run dev
   ```

2. Visit the health check endpoint:
   ```
   http://localhost:3000/api/health
   ```

3. You should see:
   ```json
   {
     "status": "ok",
     "message": "System is healthy - database connection successful",
     "database_connection": true,
     "timestamp": "2026-05-09T10:30:00Z"
   }
   ```

If you get an error:
- Check `.env.local` has all values
- Verify `SUPABASE_SERVICE_ROLE_KEY` is set correctly
- Check Supabase project is ready (no errors in project settings)
- Check database migrations ran without errors

---

## Step 7: Verify Database Setup

### In Supabase Dashboard

1. Go to **Table Editor** in left sidebar
2. Verify all tables exist:
   - ✅ businesses
   - ✅ users
   - ✅ business_users
   - ✅ patients
   - ✅ appointments
   - ✅ visits
   - ✅ visit_documentation_fields
   - ✅ visit_field_values
   - ✅ business_config
   - ✅ working_hours
   - ✅ holidays
   - ✅ doctor_unavailability

3. Check RLS is enabled:
   - Click on `patients` table
   - Look for "RLS enabled" badge
   - Should be ON (blue)

---

## Next Steps

Once database is set up and connection is verified:

1. Phase 2: Auth Foundation
   - JWT token generation/verification
   - Password hashing
   - Middleware security
   - Login page
   - Business selector

2. All subsequent phases depend on this database being functional

---

## Troubleshooting

### "Database connection failed"

**Problem:** Health check endpoint returns error

**Solutions:**
1. Check all env vars are set in `.env.local`
2. Restart dev server after changing `.env.local`
3. Verify Supabase project is running (check dashboard)
4. Check JWT_SECRET is at least 32 characters

### "Table does not exist"

**Problem:** SQL migrations didn't run properly

**Solutions:**
1. Go to Supabase SQL Editor
2. Check for errors in migration output
3. Run migrations again (idempotent - safe to retry)
4. Check all tables in Table Editor

### "Permission denied"

**Problem:** RLS policies are blocking access

**Solutions:**
1. Verify SERVICE_ROLE_KEY is correct (not the anon key)
2. Check RLS is using "deny-all for anon" pattern
3. Service role should bypass RLS automatically

### TypeScript compilation errors

**Problem:** `Database` type is not recognized

**Solutions:**
1. Run `npm run db:types` to generate types from schema
2. Ensure `src/types/database.ts` is not empty
3. If still empty, check project ID was correct in CLI command

---

## Security Checklist

- [ ] `NEXT_PUBLIC_SUPABASE_URL` is set (safe to expose)
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` is set (safe to expose)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is set (secret, not committed)
- [ ] `.env.local` is in `.gitignore` (already configured)
- [ ] RLS is enabled on all business-specific tables
- [ ] Database migrations ran successfully
- [ ] Health check endpoint returns "ok"
- [ ] Database is in India (Mumbai) region

---

## Database Schema Summary

| Table | Purpose | Business-Isolated | RLS Enabled |
|---|---|---|---|
| businesses | Clinic/practice entities | N/A | No |
| users | User accounts | No (users can belong to multiple businesses) | No |
| business_users | User→Business membership + role | Yes | No |
| patients | Patient records | Yes | ✅ |
| appointments | Scheduled visits | Yes | ✅ |
| visits | Doctor documentation | Yes | ✅ |
| visit_documentation_fields | Configurable visit fields | Yes | ✅ |
| visit_field_values | Field values from visits | Yes | ✅ |
| business_config | Business settings | Yes | No |
| working_hours | Office hours per day | Yes | ✅ |
| holidays | Closed dates | Yes | ✅ |
| doctor_unavailability | Doctor unavailable dates | Yes | ✅ |

**Key Rule:** Every query in the app filters by `business_id` to ensure isolation, even for tables without RLS.
