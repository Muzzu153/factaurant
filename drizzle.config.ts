import { config } from 'dotenv'
import { defineConfig } from 'drizzle-kit'
import { env } from './src/core/runtime/env.server'

config()

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
