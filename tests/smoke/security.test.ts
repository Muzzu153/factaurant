// tests/smoke/security.test.ts

import { describe, test, expect, beforeAll } from 'vitest'
import { db } from '../../src/core/db/client'

const APP_URL = process.env.TEST_APP_URL || 'http://localhost'; // Port 80 if Docker is running!

describe('Security Smoke Tests', () => {
beforeAll(async () => {
    // Check if server is running before attempting HTTP fetch
    try {
      await fetch(APP_URL);
    } catch {
      console.warn(`⚠️ Web server not running at ${APP_URL}. Start Docker or 'npm run dev' to run HTTP smoke tests.`);
    }
  });


  test('tenant A cannot access tenant B data', async () => {
    // Get two different tenants
    const [tenantA, tenantB] = await db.query.tenants.findMany({
      limit: 2,
      columns: { id: true, slug: true },
    })

    if (!tenantA || !tenantB) {
      throw new Error('Need at least 2 tenants for this test')
    }

    // Try to get Tenant B's menu from Tenant A's domain
    const response = await fetch(
      `http://${tenantA.slug}.localhost:3000/admin`,
      {
        headers: {
          // Try to spoof tenant ID
          'X-Tenant-ID': tenantB.id,
        },
      }
    )
    // console.log(`Response: ${response.json()}`)

    const data = await response.json()
    console.log(`Data: ${data}`)

    // Should only return Tenant A's products
    for (const product of data) {
      expect(product.id).toBe(tenantA.id)
      expect(product.id).not.toBe(tenantB.id)
    }
  })

  test('API requires valid tenant domain', async () => {
    const response = await fetch('http://invalid-tenant.localhost:3000/admin')

    // Should return 404 or error
    expect(response.ok).toBe(false)
  })
})