import { config } from 'dotenv'
import { resolve } from 'path'
import { seedOptional } from './seeds/optional'

// Load .env.local
config({ path: resolve(__dirname, '../.env.local') })

async function runSeeds() {
  console.log('Running optional database seeds...\n')

  const result = await seedOptional()
  process.exit(result ? 0 : 1)
}

runSeeds()
