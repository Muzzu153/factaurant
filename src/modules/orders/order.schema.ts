// src/modules/orders/order.schema.ts
import { z } from 'zod';

// 1. Order Lifecycle States
export const ORDER_STATUSES = [
  'pending',
  'accepted',
  'preparing',
  'ready',
  'delivered',
  'cancelled',
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

// 2. Selected Modifier Schema
export const SelectedModifierSchema = z.object({
  groupId: z.string(),
  groupName: z.string(),
  optionId: z.string(),
  optionName: z.string(),
  price: z.number().int().min(0),
});

export type SelectedModifier = z.infer<typeof SelectedModifierSchema>;

// 3. Cart / Order Line Item Schema
export const CartItemSchema = z.object({
  productId: z.uuid('Invalid product ID'),
  name: z.string().min(1, 'Product name is required'),
  basePrice: z.number().int().min(0, 'Base price must be a non-negative integer in cents/paise'),
  price: z.number().int().positive('Price must be a positive integer in cents/paise'),
  quantity: z
    .number()
    .int('Quantity must be a whole number')
    .min(1, 'Must order at least 1 item')
    .max(50, 'Cannot exceed 50 items per line'),
  imageUrl: z.string().url().nullable().optional(),
  selectedModifiers: z.array(SelectedModifierSchema).optional(),
  itemInstructions: z.string().trim().max(200).optional(),
});

export type CartItem = z.infer<typeof CartItemSchema>;

// 4. Create Order Input Schema (Checkout form)
export const OrderInputSchema = z.object({
  customerName: z.string().trim().min(2, 'Name must be at least 2 characters'),
  customerAddress: z.string().trim().min(5, 'Address must be at least 5 characters'),
  items: z.array(CartItemSchema).min(1, 'Cart cannot be empty'),
  // Optional coupon code for discounts
  couponCode: z.string().trim().max(20).optional(),
});

export type OrderInput = z.infer<typeof OrderInputSchema>;

// 5. Update Status Schema (Kitchen KDS)
export const UpdateOrderStatusSchema = z.object({
  orderId: z.uuid('Invalid order ID'),
  status: z.enum(ORDER_STATUSES),
});

export type UpdateOrderStatusInput = z.infer<typeof UpdateOrderStatusSchema>;

// 6. Track Order Schema (Customer Timeline)
export const TrackOrderSchema = z.object({
  orderId: z.uuid('Invalid order ID'),
});

export type TrackOrderInput = z.infer<typeof TrackOrderSchema>;