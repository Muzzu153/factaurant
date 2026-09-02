import { describe, test, expect, afterEach } from 'vitest'
import { createTenantScope } from '../../src/core/db/tenant-scope'

import { calculateFinalAmount } from '../../src/modules/orders/money/calculateFinalAmount'
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

afterEach(()=>{
    db.delete
})

describe('Integration: Money Persistence Consistency', () => {
    test('stored order totals match calculateFinalAmount() breakdown', async () => {
        const pizzaId = await getTenantIdBySlug('pizza-king')
        const pizzaDb = createTenantScope(pizzaId)

        const cartItems = [
            { price: 20000, quantity: 2,  }, // ₹400
            { price: 10000, quantity: 1, }, // ₹100
        ]

        const breakdown = calculateFinalAmount({
            items: cartItems,
            discount: { type: 'percentage', value: 10 },
            tax: { region: 'IN_GST' },
        })

        const [created] = await pizzaDb.orders.create({
            customerName: 'Money Test',
            customerAddress: 'Mumbai',
            items: cartItems,

            subtotalAmount: breakdown.subtotal,
            discountAmount: breakdown.discountAmount,
            taxAmount: breakdown.taxAmount,
            totalAmount: breakdown.totalPayable,

            status: 'pending',
        })

        expect(created.subtotalAmount).toBe(breakdown.subtotal)
        expect(created.discountAmount).toBe(breakdown.discountAmount)
        expect(created.taxAmount).toBe(breakdown.taxAmount)
        expect(created.totalAmount).toBe(breakdown.totalPayable)
    })

    test('discount cannot exceed subtotal (clamped to 0 payable)', async () => {
        const pizzaId = await getTenantIdBySlug('pizza-king')
        const pizzaDb = createTenantScope(pizzaId)

        const cartItems = [{ price: 10000, quantity: 1 }] // ₹100

        const breakdown = calculateFinalAmount({
            items: cartItems,
            discount: { type: 'fixed', value: 50000 }, // ₹500 off
            tax: { region: 'IN_GST' },
        })

        const [created] = await pizzaDb.orders.create({
            customerName: 'Clamp Test',
            customerAddress: 'Mumbai',
            items: cartItems,

            subtotalAmount: breakdown.subtotal,
            discountAmount: breakdown.discountAmount,
            taxAmount: breakdown.taxAmount,
            totalAmount: breakdown.totalPayable,

            status: 'pending',
        })

        expect(created.totalAmount).toBe(0)
        expect(created.taxAmount).toBe(0)
    })
})
