// scripts/db-sync.ts
import 'dotenv/config';
import pg from 'pg';
import fs from 'node:fs';
import path from 'node:path';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const connectionString = process.env.MIGRATION_DATABASE_URL || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('❌ MIGRATION_DATABASE_URL is missing in .env');
}

const cleanConnectionString = connectionString.replace(/[\?&]sslmode=[^&]+/, '');

// Load CA certificate if present
const certPath = path.resolve(process.cwd(), 'certs/prod-ca-2021.crt');
const caCert = fs.existsSync(certPath) ? fs.readFileSync(certPath, 'utf8') : undefined;

const pool = new pg.Pool({
  connectionString: cleanConnectionString,
  ssl: {
    ca: caCert,
    rejectUnauthorized: false,
  },
});

async function syncSecurity() {
  console.log('🛡️  Running Automated Security & RLS Policy Sync...');
  const client = await pool.connect();

  try {
    await client.query('BEGIN;');

    // 1. Ensure roles exist
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'factaurant_app') THEN
          CREATE ROLE factaurant_app WITH LOGIN PASSWORD 'FactaurantSecurePass2026';
        END IF;
        IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'smoke_reader') THEN
          CREATE ROLE smoke_reader;
        END IF;
      END
      $$;
    `);

    // 2. Discover all tables in public schema
    const tablesRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
    `);

    const tables = tablesRes.rows.map((r) => r.table_name);
    console.log(`📋 Found ${tables.length} tables in database:`, tables.join(', '));

    for (const table of tables) {
      // Grant standard PoLP table access
      await client.query(`
        GRANT ALL PRIVILEGES ON TABLE public."${table}" TO postgres;
        GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public."${table}" TO factaurant_app;
        GRANT SELECT ON TABLE public."${table}" TO smoke_reader;
        ALTER TABLE public."${table}" ENABLE ROW LEVEL SECURITY;
      `);

      // Check if table has a `tenant_id` column
      const colCheck = await client.query(
        `SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1 AND column_name = 'tenant_id'`,
        [table]
      );

      const hasTenantId = colCheck.rows.length > 0;

      if (hasTenantId) {
        // Drop existing policies to prevent conflicts
        await client.query(`
          DROP POLICY IF EXISTS "postgres_admin_${table}_all" ON public."${table}";
          DROP POLICY IF EXISTS "factaurant_app_${table}_isolation" ON public."${table}";
          DROP POLICY IF EXISTS "smoke_reader_can_read_${table}" ON public."${table}";
        `);

        // 🔒 Apply strict RLS with verified USING and WITH CHECK clauses
        await client.query(`
          CREATE POLICY "postgres_admin_${table}_all" 
          ON public."${table}" FOR ALL TO postgres 
          USING (true) WITH CHECK (true);

          CREATE POLICY "factaurant_app_${table}_isolation" 
          ON public."${table}" FOR ALL TO factaurant_app 
          USING (tenant_id = nullif(current_setting('app.current_tenant_id', true), '')::uuid) 
          WITH CHECK (tenant_id = nullif(current_setting('app.current_tenant_id', true), '')::uuid);

          CREATE POLICY "smoke_reader_can_read_${table}" 
          ON public."${table}" FOR SELECT TO smoke_reader 
          USING (true);
        `);
      } else if (table === 'tenants') {
        // Special case: Directory table requires public read for domain resolution
        await client.query(`
          DROP POLICY IF EXISTS "postgres_admin_tenants_all" ON public.tenants;
          DROP POLICY IF EXISTS "factaurant_app_read_tenants" ON public.tenants;
          DROP POLICY IF EXISTS "smoke_reader_can_read_tenants" ON public.tenants;

          CREATE POLICY "postgres_admin_tenants_all" 
          ON public.tenants FOR ALL TO postgres 
          USING (true) WITH CHECK (true);

          CREATE POLICY "factaurant_app_read_tenants" 
          ON public.tenants FOR SELECT TO factaurant_app 
          USING (true);

          CREATE POLICY "smoke_reader_can_read_tenants" 
          ON public.tenants FOR SELECT TO smoke_reader 
          USING (true);
        `);
      }
    }

    // 3. Grant sequence permissions
    await client.query(`
      GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;
      GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO factaurant_app;
    `);

    await client.query('COMMIT;');
    console.log('✅ All tables, RLS policies, and permissions synchronized successfully!');
  } catch (err) {
    await client.query('ROLLBACK;');
    console.error('❌ Security sync failed:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

syncSecurity();