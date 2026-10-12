import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema';
import { env } from '../runtime/env.server';
import fs from 'node:fs';
import path from 'node:path';

const connectionString = env.DATABASE_URL;

if (!connectionString) {
  throw new Error('❌ DATABASE_URL is missing in .env');
}

const isLocalDb =
  connectionString.includes('localhost') ||
  connectionString.includes('127.0.0.1') ||
  connectionString.includes('@db:');

// Strip any query parameters so pg doesn't override our SSL object
const cleanConnectionString = connectionString.replace(/[\?&]sslmode=[^&]+/, '');

// 🔒 Load the CA certificate if available
const certPath = path.resolve(process.cwd(), 'certs/prod-ca-2021.crt');
const caCert = fs.existsSync(certPath) ? fs.readFileSync(certPath, 'utf8') : undefined;

const pool = new pg.Pool({
  connectionString: cleanConnectionString,
  ssl: isLocalDb
    ? false
    : {
        ca: caCert,
        // If the CA cert is loaded, use true; if not, fallback to false so your app never halts
        rejectUnauthorized: true,
      },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

export const db = drizzle(pool, { schema });
