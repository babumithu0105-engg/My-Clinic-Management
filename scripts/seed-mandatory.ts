import { config } from 'dotenv'
import { resolve } from 'path'
import { seedMandatory } from './seeds/mandatory'

config({ path: resolve(__dirname, '../.env.local') })

async function run() {
  const result = await seedMandatory()
  process.exit(result ? 0 : 1)
}

run()
