import { config } from 'dotenv'
import fs from 'node:fs';
import path from 'node:path';
import { defineConfig } from 'drizzle-kit'
import { env } from './src/core/runtime/env.server'

// Load the correct .env file based on an explicit flag
const envFile = process.env.DRIZZLE_ENV === 'test' ? '.env.test' : '.env'
config({ path: envFile, override: true })


// process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const rawMigrationUrl = process.env.MIGRATION_DATABASE_URL || process.env.DATABASE_URL;

if (!rawMigrationUrl) {
  throw new Error('❌ MIGRATION_DATABASE_URL is missing in .env');
}

// ⚡ FIX 1: Strip `?sslmode=...` just like you did in seed.ts!
// Otherwise pg-connection-string discards your `ca` parameter.
const cleanMigrationUrl = rawMigrationUrl.replace(/[\?&]sslmode=[^&]+/, '');

// Load CA certificate if present
const certPath = path.resolve(process.cwd(), 'certs/prod-ca-2021.crt');
const caCert = fs.existsSync(certPath) ? fs.readFileSync(certPath, 'utf8') : undefined;


export default defineConfig({
  out: './drizzle',
  // Where is our schema file?
  schema: './src/core/db/schema.ts',

  // What database are we talking to?
  dialect: 'postgresql',

  // Where is the password?
  dbCredentials: {
    url: cleanMigrationUrl,
    ssl: {
      // ca: caCert,
      rejectUnauthorized: true,
    } ,
  },

  // If we want to check for data safety
  verbose: true,
  strict: true,
  schemaFilter: ['public'],
})
