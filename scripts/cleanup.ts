import { config } from 'dotenv'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'
import ws from 'ws'

config({ path: resolve(__dirname, '../.env.local') })

async function dropAllTables() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  const supabase = createClient(supabaseUrl, supabaseKey, {
    realtime: {
      transport: ws as any,
    },
  })

  try {
    console.log('⚠️  WARNING: This will DROP ALL TABLES in the database!')
    console.log('Proceeding with table cleanup...\n')

    // Drop all tables and related objects
    const dropTablesSql = `
      DROP FUNCTION IF EXISTS prevent_appointment_deletion() CASCADE;
      DROP TABLE IF EXISTS visit_field_values CASCADE;
      DROP TABLE IF EXISTS visits CASCADE;
      DROP TABLE IF EXISTS appointments CASCADE;
      DROP TABLE IF EXISTS patients CASCADE;
      DROP TABLE IF EXISTS business_users CASCADE;
      DROP TABLE IF EXISTS businesses CASCADE;
      DROP TABLE IF EXISTS working_hours CASCADE;
      DROP TABLE IF EXISTS business_config CASCADE;
      DROP TABLE IF EXISTS doctor_unavailability CASCADE;
      DROP TABLE IF EXISTS holidays CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
      DROP TABLE IF EXISTS visit_documentation_fields CASCADE;
    `

    const { error } = await supabase.rpc('exec_sql', {
      sql: dropTablesSql,
    })

    if (error) {
      if (error.message?.includes('Could not find the function') || error.message?.includes('exec_sql')) {
        console.error('❌ Error: exec_sql function not found')
        console.error('Please set up the database first by following SETUP.md\n')
        process.exit(1)
      }
      console.error('Cleanup failed:', error)
      process.exit(1)
    }

    console.log('✓ visit_field_values dropped')
    console.log('✓ visits dropped')
    console.log('✓ appointments dropped')
    console.log('✓ patients dropped')
    console.log('✓ business_users dropped')
    console.log('✓ businesses dropped')
    console.log('✓ working_hours dropped')
    console.log('\n✓ Cleanup completed - All tables removed')
    process.exit(0)
  } catch (error) {
    console.error('Cleanup failed:', error)
    process.exit(1)
  }
}

dropAllTables()
