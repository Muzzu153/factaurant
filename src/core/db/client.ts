import { drizzle } from 'drizzle-orm/node-postgres'
import pg from 'pg'
import * as schema from './schema'
import { env } from '../runtime/env.server';

const connectionString = env.DATABASE_URL;

if(!connectionString){
    throw new Error('X Database URL is missing in .env')
}
// 1. Check if connecting to a local container/host
const isLocalDb =
  connectionString.includes('localhost') ||
  connectionString.includes('127.0.0.1') ||
  connectionString.includes('@db:');

  // 2. STRIP `?sslmode=...` so pg doesn't overwrite our custom ssl config
const cleanConnectionString = connectionString.replace(/[\?&]sslmode=[^&]+/, '');

const pool = new pg.Pool({
  connectionString: cleanConnectionString,
  // If connecting to cloud database (Supabase), enable SSL with rejectUnauthorized: false
  ssl: isLocalDb ? undefined : { rejectUnauthorized: false },

    // Pool reliability settings
  max: 10,                      // Max concurrent connections in pool
  idleTimeoutMillis: 30000,     // Close idle connections after 30 seconds
  connectionTimeoutMillis: 10000 // Give 10 seconds for initial DNS & TCP handshake
});

export const db = drizzle(pool, {schema})
