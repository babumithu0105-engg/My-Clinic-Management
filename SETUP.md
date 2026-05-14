# Database Setup - One-Time Bootstrap

Your Supabase database needs a single SQL function to enable automated migrations.

## Step 1: Create the `exec_sql` Function

1. Go to **Supabase Dashboard** > Your Project > **SQL Editor**
2. Click **"New Query"**
3. Copy and paste this SQL:

```sql
CREATE OR REPLACE FUNCTION public.exec_sql(sql text)
RETURNS void AS $$
BEGIN
  EXECUTE sql;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
```

4. Click **Run**
5. Done! ✅

## Step 2: Now all npm scripts work

After creating the `exec_sql` function, you can use:

```bash
# Full reset: drop tables → create tables → seed
npm run db:reset

# Individual steps:
npm run db:cleanup      # Drop all tables and data
npm run db:migrate      # Create all tables with constraints
npm run db:seed:mandatory  # Create admin user
npm run db:seed:optional   # Create business, users, working hours
npm run db:seed         # Run both seed scripts
```

---

**Why is this needed?**

The Supabase JS client can't execute arbitrary SQL without a stored procedure. This `exec_sql` function is that bridge. It's a standard pattern and takes 30 seconds to set up once.
