import { describe, test, expect, beforeAll } from 'vitest'
import { createTenantScope } from '../../src/core/db/tenant-scope'

import { getMenuService } from '../../src/modules/menu/menu.service'
import { adminService } from '../../src/modules/admin/admin.service'

/**
 * These are hardcoded "Golden Tenants" for integratin tests.
 * This is NOT per-tenant testing at scale
 */

const TENANTS = {
    pizza: {
        id: 'c65dfef3-cfef-4470-ad51-700f7387faeb',
    },
    sushi: {
        id: '2e2fcd55-bc39-41d8-8109-e02735b93a0e',
    },
}

describe('Integration: Tenant READ Isolation', () => {
    beforeAll(async () => {
        // Optional: sanity chek scopes can be created
        createTenantScope(TENANTS.pizza.id)
        createTenantScope(TENANTS.sushi.id)
    })

    if(process.env.VITEST && !process.env.DATABASE_URL?.includes('_test')){
        throw new Error("Refusing to run tests without a *_test databse")
    }

    console.log("DATABASE_URL in test: ", process.env.DATABASE_URL)

    test('Pizza king cannot read Sushi Master Products', async () => {
        const pizzaDb = createTenantScope(TENANTS.pizza.id)
        const sushiDb = createTenantScope(TENANTS.sushi.id)

        // const pizza = await pizzaDb.self.get()
        // console.log(pizza)
        const pizzaProducts = await pizzaDb.products.findMany()
        const sushiProducts = await sushiDb.products.findMany()

        // Every product must belong to the correct tenant
        expect(pizzaProducts.every(p => p.tenantId === TENANTS.pizza.id)).toBe(true)
        expect(sushiProducts.every(p => p.tenantId === TENANTS.sushi.id)).toBe(true)

        // Cross-tenant leak check: pizza must never contain sushi tenantId
        expect(pizzaProducts.some(p => p.tenantId === TENANTS.sushi.id)).toBe(false)
        expect(sushiProducts.some(p => p.tenantId === TENANTS.pizza.id)).toBe(false)
    })

    test('Pizza King cannot read Sushi Master orders', async () => {
        const pizzaDb = createTenantScope(TENANTS.pizza.id)
        const sushiDb = createTenantScope(TENANTS.sushi.id)

        const pizzaOrders = await pizzaDb.orders.findMany()
        const sushiOrders = await sushiDb.orders.findMany()

        expect(pizzaOrders.every(o => o.tenantId === TENANTS.pizza.id)).toBe(true)
        expect(sushiOrders.every(o => o.tenantId === TENANTS.sushi.id)).toBe(true)

        expect(pizzaOrders.some(o => o.tenantId === TENANTS.sushi.id)).toBe(false)
        expect(sushiOrders.some(o => o.tenantId === TENANTS.pizza.id)).toBe(false)

    })

    test('getMenuService returns only tenant products', async () => {
        const pizzaDb = createTenantScope(TENANTS.pizza.id)

        const menu = await getMenuService(pizzaDb)

        expect(menu.length).toBeGreaterThanOrEqual(0)
        expect(menu.every(p => p.tenantId === TENANTS.pizza.id)).toBe(true)
    })

    test('adminService returns only tenant orders', async () => {
        const pizzaDb = createTenantScope(TENANTS.pizza.id)

        const pizzaOrders = await adminService(pizzaDb)

        expect(pizzaOrders.length).toBeGreaterThanOrEqual(0)
        expect(pizzaOrders.every(o => o.tenantId === TENANTS.pizza.id)).toBe(true)
    })
})


