# Database Migrations

This directory contains incremental database migration files following the date-based naming convention: `YYYYMMDD_description.sql`

## Process

### For Development
1. Run the main `docs/supabase-migrations.sql` to create fresh schema
2. Apply any new migration files in chronological order

### For Production

**Option 1: Fresh Deployment (Recommended)**
- Run the complete `docs/supabase-migrations.sql` to create entire schema from scratch
- Ensures consistency and clean state

**Option 2: Incremental Migration**
- Start with main schema file if not already deployed
- Apply individual migration files in order (oldest first)
- Use rollback SQL comments if a migration fails

## Migration Files

| File | Date | Change |
|------|------|--------|
| supabase-migrations.sql | - | Complete schema definition |
| 20260510_add_patient_status.sql | 2026-05-10 | Added active/inactive status to patients |

## How to Apply Migrations in Supabase

1. **To run main schema:**
   - Copy entire contents of `supabase-migrations.sql`
   - Paste into Supabase SQL Editor
   - Click Run

2. **To apply incremental migration:**
   - Copy contents of migration file (e.g., `20260510_add_patient_status.sql`)
   - Paste into Supabase SQL Editor
   - Click Run

3. **If something breaks:**
   - Use the rollback SQL comments at bottom of migration file
   - Paste rollback SQL into editor
   - Click Run
   - Fix the issue and re-apply

## Important Notes

- Always backup your Supabase database before applying migrations
- Test migrations on development environment first
- Keep the main `supabase-migrations.sql` in sync with the actual schema
- Add new migration files for any schema changes
- Each migration should be idempotent where possible (safe to run multiple times)
