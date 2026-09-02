// tests/smoke/security.test.ts

import { describe, test, expect } from 'vitest'
import { db } from '../../src/core/db/client'

describe('Security Smoke Tests', () => {
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

    const data = await response.json()

    // Should only return Tenant A's products
    for (const product of data) {
      expect(product.tenantId).toBe(tenantA.id)
      expect(product.tenantId).not.toBe(tenantB.id)
    }
  })

  test('API requires valid tenant domain', async () => {
    const response = await fetch('http://invalid-tenant.localhost:3000/admin')

    // Should return 404 or error
    expect(response.ok).toBe(false)
  })
})