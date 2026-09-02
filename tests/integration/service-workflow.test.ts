import { describe, test, expect, afterEach } from 'vitest'
import { createTenantScope } from '../../src/core/db/tenant-scope'

import { db } from '../../src/core/db/client'
import { tenants } from '../../src/core/db/schema'
import { eq } from 'drizzle-orm'

import { getMenuService } from '../../src/modules/menu/menu.service'
import { adminService } from '../../src/modules/admin/admin.service'
import { createOrderService } from '../../src/modules/orders/order.service'
import { OrderInputSchema } from '../../src/modules/orders/order.schema'

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

describe('Integration: Service Workflow', () => {
    test('getMenuService returns only tenant menu', async () => {
        const pizzaId = await getTenantIdBySlug('pizza-king')
        const pizzaDb = createTenantScope(pizzaId)

        const menu = await getMenuService(pizzaDb)

        expect(menu.every(p => p.tenantId === pizzaId)).toBe(true)
    })

    test('submitOrderService creates an order for correct tenant', async () => {
        const pizzaId = await getTenantIdBySlug('pizza-king')
        const pizzaDb = createTenantScope(pizzaId)

        const order = await createOrderService.placeOrder(pizzaDb, {
            customerName: 'Workflow User',
            customerAddress: 'Mumbai',
            items: [
                { name: 'Burger', price: 10000, quantity: 2 },
                { name: 'Fries', price: 5000, quantity: 1 },
            ],
        })

        expect(order.tenantId).toBe(pizzaId)
        expect(order.totalAmount).toBeGreaterThan(0)
    })

    test('order defaults to pending status', async () => {
        const pizzaId = await getTenantIdBySlug('pizza-king')
        const pizzaDb = createTenantScope(pizzaId)

        const order = await createOrderService.placeOrder(pizzaDb, {
            customerName: 'Status User',
            customerAddress: 'Mumbai',
            items: [{ name: 'Pizza', price: 20000, quantity: 1 }],
        })

        expect(order.status).toBe('pending')
    })

    test('adminService returns only tenant orders', async () => {
        const pizzaId = await getTenantIdBySlug('pizza-king')
        const pizzaDb = createTenantScope(pizzaId)

        const orders = await adminService(pizzaDb)

        expect(orders.every(o => o.tenantId === pizzaId)).toBe(true)
    })

    test('pizza tenant cannot see sushi tenant orders via adminService', async () => {
        const pizzaId = await getTenantIdBySlug('pizza-king')
        const sushiId = await getTenantIdBySlug('sushi-master')

        const pizzaDb = createTenantScope(pizzaId)
        const sushiDb = createTenantScope(sushiId)

        // create sushi order
        await createOrderService.placeOrder(sushiDb, {
            customerName: 'Sushi Customer',
            customerAddress: 'Sushi Street',
            items: [{ name: 'Sushi', price: 30000, quantity: 1 }],
        })

        const pizzaOrders = await adminService(pizzaDb)
        expect(pizzaOrders.some(o => o.tenantId === sushiId)).toBe(false)
    })

    test('order defaults to pending status', async () => {        
         expect(() =>
            OrderInputSchema.parse({
                customerName: 'Status User',
                customerAddress: 'Mumbai',
                items: [],
            })
        ).toThrow()
    })
})
