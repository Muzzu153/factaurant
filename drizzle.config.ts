import { config } from 'dotenv'
import { defineConfig } from 'drizzle-kit'
// import { env } from './src/core/runtime/env.server'

// Load the correct .env file based on an explicit flag
const envFile = process.env.DRIZZLE_ENV === 'test' ? '.env.test' : '.env'
config({ path:  envFile , override: true })

console.log('[drizzle.config.ts] DRIZZLE_ENV:', process.env.DRIZZLE_ENV)
console.log('[drizzle.config.ts] envFile used:', envFile)
console.log('[drizzle.config.ts] DATABASE_URL:', process.env.DATABASE_URL)

export default defineConfig({
  out: './drizzle',
  // Where is our schema file?
  schema: './src/core/db/schema.ts',
  
  // What database are we talking to?
  dialect: 'postgresql',
  
  // Where is the password?
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  
  // If we want to check for data safety
  verbose: true,
  strict: true,
})
