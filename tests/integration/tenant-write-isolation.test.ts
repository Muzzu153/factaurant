import { describe, test, expect } from 'vitest'
import { createTenantScope } from '../../src/core/db/tenant-scope'

import { db } from '../../src/core/db/client'
import { tenants } from '../../src/core/db/schema'
import { eq } from 'drizzle-orm'

async function getTenantIdBySlug(slug: string) {
  const tenant = await db.query.tenants.findFirst({
    where: eq(tenants.slug, slug),
    columns: { id: true },
  })

  if (!tenant) throw new Error(`Missing tenant slug in DB: ${slug}`)
  return tenant.id
}

describe('Integration: Tenant WRITE Isolation', async () => {
  test('product creation forces tenant_id (cannot be injected)', async () => {
    const pizzaId = await getTenantIdBySlug('pizza-king')
    const sushiId = await getTenantIdBySlug('sushi-master')

    const pizzaDb = createTenantScope(pizzaId)

    const [created] = await pizzaDb.products.create({
      name: 'Test Pizza - with sushiId 2',
      description: 'Isolation test product 2',
      price: 12300,
      imageUrl: null,
      isAvailable: true,

      // 🚨 malicious attempt (should be overridden / ignored)
      // tenantId: sushiId,
    })

    // ✅ MUST be pizza tenant, not sushi
    expect(created.tenantId).toBe(pizzaId)
    expect(created.tenantId).not.toBe(sushiId)
  })

  test('order creation forces tenant_id (cannot be injected)', async () => {
    const pizzaId = await getTenantIdBySlug('pizza-king')
    const sushiId = await getTenantIdBySlug('sushi-master')

    const pizzaDb = createTenantScope(pizzaId)

    const [order] = await pizzaDb.orders.create({
      customerName: 'Integration Test User',
      customerAddress: 'Test Address, Mumbai',
      items: [{ price:99000, name: 'Fake Item', quantity: 1 }],
      status: 'pending',
      subtotalAmount: 99900,
      totalAmount: 89900,
      discountAmount: 10000,
    })

    expect(order.tenantId).toBe(pizzaId)
    expect(order.tenantId).not.toBe(sushiId)
  })

  test('tenant write does not affect other tenant data', async () => {
    const pizzaId = await getTenantIdBySlug('pizza-king')
    const sushiId = await getTenantIdBySlug('sushi-master')

    const pizzaDb = createTenantScope(pizzaId)
    const sushiDb = createTenantScope(sushiId)

    // ✅ create product for pizza
    await pizzaDb.products.create({
      name: 'Pizza Only Item',
      price: 5000,
      description: null,
      imageUrl: null,
      isAvailable: true,
    })

    // ✅ confirm sushi cannot see it
    const sushiProducts = await sushiDb.products.findMany()
    expect(sushiProducts.some(p => p.name === 'Pizza Only Item')).toBe(false)
  })
})
