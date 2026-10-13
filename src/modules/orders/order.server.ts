// src/modules/orders/order.server.ts
import { tenantFn, protectedTenantFn } from '@/core/runtime/serverFns';
import { createOrderService } from './order.service';
import { TrackOrderSchema, UpdateOrderStatusSchema } from './order.schema';

// 🌐 1. CUSTOMER LIVE TRACKING (Public with orderId)
export const trackOrder = tenantFn
  .inputValidator(TrackOrderSchema)
  .handler(async ({ context, data }) => {
    return await createOrderService.getOrder(context.db, data.orderId);
  });

// 🔒 2. KITCHEN STATUS UPDATE (Protected: Staff / Manager only)
export const updateOrderStatus = protectedTenantFn
  .inputValidator(UpdateOrderStatusSchema)
  .handler(async ({ context, data }) => {
    return await createOrderService.updateStatus(context.db, data.orderId, data.status);
  });