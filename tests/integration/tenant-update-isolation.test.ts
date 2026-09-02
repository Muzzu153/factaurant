import { describe, test, expect } from 'vitest'
import { createTenantScope } from '../../src/core/db/tenant-scope'

import { db } from '../../src/core/db/client'
import { tenants } from '../../src/core/db/schema'
import { eq } from 'drizzle-orm'
import { calculateFinalAmount } from '../../src/modules/orders/money/calculateFinalAmount'
import { afterEach } from 'node:test'

async function getTenantIdBySlug(slug: string) {
  const tenant = await db.query.tenants.findFirst({
    where: eq(tenants.slug, slug),
    columns: { id: true },
  })

  if (!tenant) throw new Error(`Missing tenant slug in DB: ${slug}`)
  return tenant.id
}

afterEach(()=>{
  db.delete
})

describe('Integration: Tenant UPDATE/DELETE Isolation', () => {
  test('Pizza cannot update Sushi product', async () => {
    const pizzaId = await getTenantIdBySlug('pizza-king')
    const sushiId = await getTenantIdBySlug('sushi-master')

    const pizzaDb = createTenantScope(pizzaId)
    const sushiDb = createTenantScope(sushiId)

    // ✅ Create product under Sushi tenant
    const [sushiProduct] = await sushiDb.products.create({
      name: 'Sushi create method test',
      description: null,
      price: 9999,
      imageUrl: null,
      isAvailable: true,

      // tenantId: sushiId,
    })

    // 🚨 Pizza tries to update sushi product
    const updated = await pizzaDb.products.update(sushiId, {
      name: 'HACKED BY PIZZA',
    })

    // ✅ Must update NOTHING
    expect(updated.length).toBe(0)

    // ✅ Sushi still sees original name
    const sushiProducts = await sushiDb.products.findMany()
    const stillThere = sushiProducts.find(p => p.id === sushiProduct.id)
    console.log(stillThere?.name)

    expect(stillThere?.name).toBe('Sushi create method test')
  })

  test('Pizza cannot delete Sushi product', async () => {
    const pizzaId = await getTenantIdBySlug('pizza-king')
    const sushiId = await getTenantIdBySlug('sushi-master')

    const pizzaDb = createTenantScope(pizzaId)
    const sushiDb = createTenantScope(sushiId)

    const [sushiProduct] = await sushiDb.products.create({
      name: 'Sushi Delete Protected',
      description: null,
      price: 5000,
      imageUrl: null,
      isAvailable: true,
    })

    // 🚨 Pizza tries to delete sushi product
    const deleted = await pizzaDb.products.delete(sushiProduct.id)

    expect(deleted.length).toBe(0)

    // ✅ Sushi must still have it
    const sushiProducts = await sushiDb.products.findMany()
    expect(sushiProducts.some(p => p.id === sushiProduct.id)).toBe(true)
  })

  test('Pizza cannot update Sushi order status', async () => {
    const pizzaId = await getTenantIdBySlug('pizza-king')
    const sushiId = await getTenantIdBySlug('sushi-master')

    const pizzaDb = createTenantScope(pizzaId)
    const sushiDb = createTenantScope(sushiId)

     const itemsInCart = [{ name: 'Test-item-1', quantity: 1, price: 25000 }];

    const breakdown = calculateFinalAmount({ items: itemsInCart, tax: { region: 'IN_GST' }, discount: { type: 'percentage', value: 25 } })

    const [sushiOrder] = await sushiDb.orders.create({
      customerName: 'Sushi Customer 2',
      customerAddress: 'Sushi Address 2',
      items: itemsInCart,
      totalAmount: 32300,
      status: 'pending',
      subtotalAmount: breakdown.subtotal,
      taxAmount: breakdown.taxAmount,
      discountAmount: breakdown.discountAmount,
    })

    // 🚨 Pizza tries to update sushi order
    const updated = await pizzaDb.orders.updateStatus(sushiOrder.id, 'cancelled')

    expect(updated.length).toBe(0)

    // ✅ Sushi still sees pending
    const sushiOrders = await sushiDb.orders.findMany()
    const stillThere = sushiOrders.find(o => o.id === sushiOrder.id)

    expect(stillThere?.status).toBe('pending')
  })

  test('Pizza cannot delete Sushi order', async () => {
    const pizzaId = await getTenantIdBySlug('pizza-king')
    const sushiId = await getTenantIdBySlug('sushi-master')

    const pizzaDb = createTenantScope(pizzaId)
    const sushiDb = createTenantScope(sushiId)

    const itemsInCart = [{ name: 'Test-item-2', quantity: 1, price: 25000 }];

    const breakdown = calculateFinalAmount({ items: itemsInCart, tax: { region: 'NO_TAX' }, discount: { type: 'fixed', value: 1000 } })

    const [sushiOrder] = await sushiDb.orders.create({
      customerName: 'Sushi Customer 2',
      customerAddress: 'Sushi Address 2',
      items: itemsInCart,
      totalAmount: 25000,
      status: 'pending',
      subtotalAmount: breakdown.subtotal,
      taxAmount: breakdown.taxAmount,
      discountAmount: breakdown.discountAmount,
    })

    // 🚨 Pizza tries to delete sushi order
    const deleted = await pizzaDb.orders.delete(sushiOrder.id)

    expect(deleted.length).toBe(0)

    // ✅ Sushi still has it
    const sushiOrders = await sushiDb.orders.findMany()
    expect(sushiOrders.some(o => o.id === sushiOrder.id)).toBe(true)
  })


})
