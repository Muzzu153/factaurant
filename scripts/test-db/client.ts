// scripts/test-db/client.ts

import { config } from 'dotenv'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from '../../src/core/db/schema'

// ✅ Explicitly load .env.test, force override to avoid the dotenv-priority bug
config({ path: '.env.test', override: true })

if (!process.env.DATABASE_URL?.includes('5433')) {
  throw new Error(
    `🚨 SAFETY CHECK FAILED: DATABASE_URL does not look like the Docker test DB (expected port 5433).\n` +
    `Got: ${process.env.DATABASE_URL}\n` +
    `Refusing to run to avoid accidentally touching the wrong database.`
  )
}

const client = postgres(process.env.DATABASE_URL)
export const testDb = drizzle(client, { schema })
export const rawClient = client