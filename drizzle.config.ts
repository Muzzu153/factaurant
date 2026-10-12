import { config } from 'dotenv'
import { defineConfig } from 'drizzle-kit'
import { env } from './src/core/runtime/env.server'

// Load the correct .env file based on an explicit flag
const envFile = process.env.DRIZZLE_ENV === 'test' ? '.env.test' : '.env'
config({ path: envFile, override: true })


process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const migrationUrl = process.env.MIGRATION_DATABASE_URL

if (!migrationUrl) {
  throw new Error('❌ MIGRATION_DATABASE_URL is missing in .env');
}

export default defineConfig({
  out: './drizzle',
  // Where is our schema file?
  schema: './src/core/db/schema.ts',

  // What database are we talking to?
  dialect: 'postgresql',

  // Where is the password?
  dbCredentials: {
    url: env.MIGRATION_DATABASE_URL!,
    ssl: {
      rejectUnauthorized: false,
    },
  },

  // If we want to check for data safety
  verbose: true,
  strict: true,
   schemaFilter: ['public'], 
})
