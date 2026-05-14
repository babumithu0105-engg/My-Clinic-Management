import { config } from 'dotenv'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'
import ws from 'ws'
import { readFileSync } from 'fs'
import { join } from 'path'

config({ path: resolve(__dirname, '../.env.local') })

async function runMigrations() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  const supabase = createClient(supabaseUrl, supabaseKey, {
    realtime: {
      transport: ws as any,
    },
  })

  try {
    console.log('Running migrations...\n')

    // Read migration file
    const migrationPath = join(__dirname, '../supabase/migrations/20240101120000_initial_schema.sql')
    const migrationSql = readFileSync(migrationPath, 'utf-8')

    // Execute the entire migration SQL file via exec_sql function
    const { error } = await supabase.rpc('exec_sql', {
      sql: migrationSql,
    })

    if (error) {
      // Check if exec_sql function doesn't exist
      if (error.message?.includes('Could not find the function') || error.message?.includes('exec_sql')) {
        console.error('❌ Error: exec_sql function not found in Supabase')
        console.error('\nPlease set up the database first by following SETUP.md:')
        console.error('1. Go to Supabase Dashboard > SQL Editor > New Query')
        console.error('2. Paste the SQL from SETUP.md')
        console.error('3. Run it, then try this command again\n')
        process.exit(1)
      }

      console.error('Migration error:', error)
      process.exit(1)
    }

    console.log('✓ All migrations completed successfully')
    process.exit(0)
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }
}

runMigrations()
