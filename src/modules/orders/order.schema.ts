import { z } from 'zod'
import { CartItemSchema } from '@/core/db/zod-schema/order.schema';

// 1. THE 6 ORDER LIFECYCLE STATES
export const ORDER_STATUSES = [
  'pending',    // Customer placed order, awaiting kitchen review
  'accepted',   // Kitchen acknowledged the ticket
  'preparing',  // Chefs are actively cooking
  'ready',      // Packaged and waiting for pickup or delivery driver
  'delivered',  // Completed transaction
  'cancelled',  // Order rejected or cancelled
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];


// 3. EXISTING CREATE ORDER SCHEMA (from Phase 6)
export const OrderInputSchema = z.object({
  customerName: z.string().min(2, 'Name must be at least 2 characters'),
  customerAddress: z.string().min(5, 'Address must be at least 5 characters'),
  items: z.array(CartItemSchema).min(1, 'Cart cannot be empty'),
})

export type OrderInput = z.infer<typeof OrderInputSchema>

// 4. UPDATE STATUS SCHEMA (For Kitchen Staff & Managers)
export const UpdateOrderStatusSchema = z.object({
  orderId: z.uuid('Invalid order ID'),
  status: z.enum(ORDER_STATUSES),
});

export type UpdateOrderStatusInput = z.infer<typeof UpdateOrderStatusSchema>;

// 5. TRACK ORDER SCHEMA (For Customers)
export const TrackOrderSchema = z.object({
  orderId: z.uuid('Invalid order ID'),
});

export type TrackOrderInput = z.infer<typeof TrackOrderSchema>;
