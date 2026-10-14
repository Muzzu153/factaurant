// src/modules/orders/order.server.ts
import { tenantFn, protectedTenantFn } from '@/core/runtime/serverFns';
import { orderService } from './order.service';
import { TrackOrderSchema, UpdateOrderStatusSchema } from './order.schema';
import { couponService } from './coupon.service';
import { ValidateCouponSchema } from './coupon.schema';

// 🌐 1. CUSTOMER LIVE TRACKING (Public with orderId)
export const trackOrder = tenantFn
  .inputValidator(TrackOrderSchema)
  .handler(async ({ context, data }) => {
    return await orderService.getOrder(context.db, data.orderId);
  });

// 🔒 2. KITCHEN STATUS UPDATE (Protected: Staff / Manager only)
export const updateOrderStatus = protectedTenantFn
  .inputValidator(UpdateOrderStatusSchema)
  .handler(async ({ context, data }) => {
    return await orderService.updateStatus(context.db, data.orderId, data.status);
  });


  // 3. VALIDATE COUPON CODE (Public for Storefront Customers)
export const validateCoupon = tenantFn
  .inputValidator(ValidateCouponSchema)
  .handler(async ({ context, data }) => {
    return await couponService.validate(context.db, data);
  });