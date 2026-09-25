// scripts/test-db/reset.ts

import { testDb, rawClient } from './client'
import { sql } from 'drizzle-orm'

async function reset() {
  console.log('🧹 Resetting test database...')

  // TRUNCATE ... CASCADE handles FK dependencies automatically
  // RESTART IDENTITY resets any serial/identity columns (not used here since we use UUIDs, but harmless)
  await testDb.execute(sql`
    TRUNCATE TABLE orders, products, tenants
    RESTART IDENTITY CASCADE
  `)

  console.log('✅ All tables truncated')
  await rawClient.end()
}

reset().catch((err) => {
  console.error('❌ Reset failed:', err)
  process.exit(1)
})