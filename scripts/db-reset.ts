import { config } from 'dotenv'
import { resolve } from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

config({ path: resolve(__dirname, '../.env.local') })

async function runReset() {
  try {
    console.log('🔄 Running full database reset...\n')

    const commands = [
      { name: 'Cleanup', cmd: 'npm run db:cleanup' },
      { name: 'Migrate', cmd: 'npm run db:migrate' },
      { name: 'Seed', cmd: 'npm run db:seed' },
    ]

    for (const { name, cmd } of commands) {
      console.log(`\n📌 ${name}...`)
      try {
        const { stdout } = await execAsync(cmd)
        console.log(stdout)
      } catch (error: any) {
        console.error(`❌ ${name} failed:`)
        console.error(error.stderr || error.message)
        process.exit(1)
      }
    }

    console.log('\n✅ Database reset completed successfully!')
  } catch (error) {
    console.error('Fatal error:', error)
    process.exit(1)
  }
}

runReset()
