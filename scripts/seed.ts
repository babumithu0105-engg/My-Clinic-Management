import { config } from 'dotenv'
import { resolve } from 'path'
import { seedWorkingHours } from './seeds/working-hours'

// Load .env.local
config({ path: resolve(__dirname, '../.env.local') })

async function runSeeds() {
  console.log('Running database seeds...\n')

  const results = {
    success: 0,
    failed: 0,
  }

  // Run working hours seed
  if (await seedWorkingHours()) {
    results.success++
  } else {
    results.failed++
  }

  console.log(`\nSeed Results: ${results.success} succeeded, ${results.failed} failed`)
  process.exit(results.failed > 0 ? 1 : 0)
}

runSeeds()
