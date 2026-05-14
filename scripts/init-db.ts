import { config } from 'dotenv'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'
import ws from 'ws'

config({ path: resolve(__dirname, '../.env.local') })

async function initDatabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  const supabase = createClient(supabaseUrl, supabaseKey, {
    realtime: {
      transport: ws as any,
    },
  })

  try {
    console.log('Initializing database...\n')

    // Create the exec_sql function using a simple RPC call
    // We'll use a different approach: create a wrapper that handles SQL execution
    const createFunctionSQL = `
      CREATE OR REPLACE FUNCTION public.exec_sql(sql TEXT)
      RETURNS void AS $$
      BEGIN
        EXECUTE sql;
      END;
      $$ LANGUAGE plpgsql;
    `

    // Try to create the function using pgSQL
    const { error: initError } = await supabase.rpc('pg_sleep', { seconds: 0 })

    if (initError?.message?.includes('function') && initError.message?.includes('does not exist')) {
      console.log('⚠️  Cannot initialize exec_sql function - RPC not available')
      console.log('\nTo set up your database, please run this SQL in Supabase SQL Editor:')
      console.log('\n' + createFunctionSQL)
      console.log('\nThen run: npm run db:migrate')
      process.exit(1)
    }

    // If we got here, try a different approach - just report what needs to be done
    console.log('✓ Database initialization required')
    console.log('\nPlease run this SQL in Supabase SQL Editor (Dashboard > SQL Editor):\n')
    console.log(createFunctionSQL)
    console.log('\nAfter that, migrations will work automatically.')

    process.exit(0)
  } catch (error) {
    console.error('Database initialization failed:', error)
    process.exit(1)
  }
}

initDatabase()
