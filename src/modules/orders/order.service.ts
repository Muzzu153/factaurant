import type { TenantScope } from '../../core/db/tenant-scope'
import { calculateFinalAmount } from './money/calculateFinalAmount'
import { type OrderInput } from './order.schema'

// THE BUSINESS LOGIC
// This function doesn't know about HTTP or TanStack Start.
// It only knows about the Database Wrapper (TenantScope).
export const createOrderService = {
  placeOrder: async (db: TenantScope, input: OrderInput) => {
    // A. Calculate Total on Server (Trust but Verify)
    const amountBreakdown = calculateFinalAmount({
      items: input.items,
      discount: { type: 'percentage', value: 15 },
      tax: { region: 'IN_GST' },
    })

    // B. Write to Database using the SAFE Wrapper
    // Notice: We don't need to pass tenantId. The 'db' object already has it locked.
    const [newOrder] = await db.orders.create({
      customerName: input.customerName,
      customerAddress: input.customerAddress,
      items: input.items, // Storing JSON blob for MVP

      subtotalAmount: amountBreakdown.subtotal,
      discountAmount: amountBreakdown.discountAmount,
      taxAmount: amountBreakdown.taxAmount,
      totalAmount: amountBreakdown.totalPayable,

      status: 'pending',
    })

    console.log(
      `✅ Order placed: ${newOrder.id} for $${amountBreakdown.totalPayable / 100}`,
    )

    return newOrder
  },
}
