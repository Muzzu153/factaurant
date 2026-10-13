import type { TenantScope } from '../../core/db/tenant-scope'
import { calculateFinalAmount } from './money/calculateFinalAmount'
import { type OrderInput } from './order.schema'
import { OrderStatus } from './order.schema';

// 🔒ALLOWED TRANSITIONS TABLE (Prevents jumping from pending -> delivered)
const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['accepted', 'cancelled'],
  accepted: ['preparing', 'cancelled'],
  preparing: ['ready', 'cancelled'],
  ready: ['delivered', 'cancelled'],
  delivered: [], // Terminal state
  cancelled: [], // Terminal state
};

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

    return newOrder
  },
    // 2. GET ORDER DETAILS (For Customer Tracking & KDS)
    getOrder: async (db: TenantScope, orderId: string) => {
      const order = await db.orders.findById(orderId);
      if (!order) {
        throw new Error('Order not found or does not belong to this restaurant.');
      }
      return order;
    },

    // ⚡ 3. TRANSITION ORDER STATUS (For Kitchen Staff)
    updateStatus: async (db: TenantScope, orderId: string, nextStatus: OrderStatus) => {
      const currentOrder = await db.orders.findById(orderId);
      if (!currentOrder) {
        throw new Error('Order not found.');
      }

      const currentStatus = currentOrder.status as OrderStatus;
      const allowedNext = VALID_TRANSITIONS[currentStatus] || [];

      // Enforce valid lifecycle flow
      if (!allowedNext.includes(nextStatus)) {
        throw new Error(
          `Invalid status transition from "${currentStatus}" to "${nextStatus}". Allowed: ${allowedNext.join(', ')}`
        );
      }

      const updated = await db.orders.updateStatus(orderId, nextStatus);
      console.log(`🍳 Order ${orderId} progressed: ${currentStatus} -> ${nextStatus}`);
      return updated;
    }
  
    
  }
