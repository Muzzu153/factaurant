// src/modules/orders/order.service.ts
import type { TenantScope } from '@/core/db/tenant-scope';
import type { OrderInput, OrderStatus } from './order.schema';
import { couponService } from './coupon.service';

const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['accepted', 'cancelled'],
  accepted: ['preparing', 'cancelled'],
  preparing: ['ready', 'cancelled'],
  ready: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
};

export const orderService = {
  // 1. Create Order with Server-Side Coupon Verification
  createOrder: async (db: TenantScope, input: OrderInput) => {
    // Calculate raw line-item subtotal
    const subtotal = input.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    let discountAmount = 0;

    // Authoritatively re-validate coupon on server
    if (input.couponCode) {
      try {
        const validated = await couponService.validate(db, {
          code: input.couponCode,
          subtotal,
        });
        discountAmount = validated.discountAmount;
      } catch (err: any) {
        // If coupon failed validation during final submission, reject the order
        throw new Error(`Checkout failed: ${err.message}`);
      }
    }

    // Calculate tax on the discounted subtotal
    const taxableAmount = Math.max(0, subtotal - discountAmount);
    const tax = Math.round(taxableAmount * 0.05); // 5% GST standard
    const total = taxableAmount + tax;

    const [newOrder] = await db.orders.create({
      customerName: input.customerName,
      customerAddress: input.customerAddress,
      items: input.items,
      subtotalAmount: subtotal,
      discountAmount,
      taxAmount: tax,
      totalAmount: total,
      status: 'pending',
    });

    return newOrder;
  },

  getOrder: async (db: TenantScope, orderId: string) => {
    const order = await db.orders.findById(orderId);
    if (!order) {
      throw new Error('Order not found or does not belong to this restaurant.');
    }
    return order;
  },

  updateStatus: async (db: TenantScope, orderId: string, nextStatus: OrderStatus) => {
    const currentOrder = await db.orders.findById(orderId);
    if (!currentOrder) {
      throw new Error('Order not found.');
    }

    const currentStatus = currentOrder.status as OrderStatus;
    const allowedNext = VALID_TRANSITIONS[currentStatus] || [];

    if (!allowedNext.includes(nextStatus)) {
      throw new Error(
        `Invalid status transition from "${currentStatus}" to "${nextStatus}". Allowed: ${allowedNext.join(', ')}`
      );
    }

    const updated = await db.orders.updateStatus(orderId, nextStatus);
    return updated;
  },
};