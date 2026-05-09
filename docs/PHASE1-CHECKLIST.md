# Phase 1 — Database Setup Checklist

## What You Need to Do (in Supabase)

- [ ] **1. Create Supabase Project**
  - Region: **India (Mumbai)** ⚠️ CRITICAL
  - Store project ID and database password securely

- [ ] **2. Run SQL Migrations**
  - File: `docs/supabase-migrations.sql`
  - Copy entire content → Supabase SQL Editor → Run
  - Verify all 12 tables are created

- [ ] **3. Get Your Credentials**
  - `NEXT_PUBLIC_SUPABASE_URL` (Project URL from API settings)
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Public API key)
  - `SUPABASE_SERVICE_ROLE_KEY` (Secret API key)

- [ ] **4. Add to `.env.local`**
  - All three credentials above
  - Do NOT commit `.env.local` to git (already in .gitignore)

- [ ] **5. Generate TypeScript Types**
  - Run: `npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.ts`
  - Or use Supabase CLI: `npm run db:types`

---

## What Claude Has Provided

### Files Created

- ✅ `docs/supabase-migrations.sql` — Complete SQL for all tables + RLS policies
- ✅ `docs/SUPABASE-SETUP-GUIDE.md` — Step-by-step instructions
- ✅ `src/lib/supabase/server.ts` — Server-side Supabase client (service role)
- ✅ `src/lib/supabase/client.ts` — Browser Supabase client (anon key)
- ✅ `src/types/database.ts` — Placeholder for generated types
- ✅ `src/types/index.ts` — App-level TypeScript types
- ✅ `src/app/api/health/route.ts` — Health check endpoint for testing

### Architecture

**Security Model:**
- Service role key on server only (never exposed to browser)
- RLS deny-all for anon (defense-in-depth)
- JWT authentication via Next.js middleware (Phase 2)
- All data access filtered by `business_id` in API routes

**Database:**
- 12 tables with proper relationships
- Indexes on frequently queried columns
- Constraints for data integrity
- Complete data isolation per business

---

## Next Steps (After Supabase Setup)

1. **Test the connection:**
   ```bash
   npm run dev
   # Visit: http://localhost:3000/api/health
   ```

2. **Verify health check returns `status: "ok"`**

3. **Once verified, inform Claude and proceed to Phase 2:**
   - Authentication system
   - JWT token generation
   - Login page
   - Business selector
   - Middleware security

---

## Estimated Time

**Supabase Setup:** 10-15 minutes
- Create project: 3 min
- Run migrations: 1 min
- Get credentials: 3 min
- Generate types: 2 min
- Test connection: 2 min

**Phase 1 Total:** ~15 minutes (once Supabase is ready)

---

## Important Reminders

⚠️ **Region MUST be India (Mumbai)**
- Data residency requirement
- Select during project creation
- Cannot be changed easily later

⚠️ **Keep SERVICE_ROLE_KEY Secret**
- Never commit to git
- Never expose to browser
- Only use in `.env.local` and server code

✅ **RLS is Defense-in-Depth**
- Deny-all for anon (public key)
- Service role bypasses RLS (server-side only)
- All API routes validate `business_id` via JWT

---

## Files Reference

| File | Purpose | Done |
|---|---|---|
| supabase-migrations.sql | SQL to create all tables | ✅ |
| SUPABASE-SETUP-GUIDE.md | Step-by-step instructions | ✅ |
| src/lib/supabase/server.ts | Service role client | ✅ |
| src/lib/supabase/client.ts | Anon key client | ✅ |
| src/types/database.ts | Generated types (placeholder) | ✅ |
| src/types/index.ts | App types | ✅ |
| src/app/api/health/route.ts | Connection test | ✅ |
| .env.local | Your credentials | Waiting for you |
| .env.example | Template | ✅ |

---

## How to Proceed

1. Follow `SUPABASE-SETUP-GUIDE.md` step-by-step
2. Test connection with health check endpoint
3. When everything works, message Claude: "Phase 1 complete"
4. Claude will build Phase 2 (Auth Foundation)
