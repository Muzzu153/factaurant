// src/modules/orders/coupon.schema.ts
import { z } from 'zod';

// Schema for validating a coupon code against a cart subtotal
export const ValidateCouponSchema = z.object({
  code: z
    .string()
    .trim()
    .min(2, 'Coupon code must be at least 2 characters')
    .max(20, 'Coupon code cannot exceed 20 characters'),
  subtotal: z
    .number()
    .int('Subtotal must be an integer in cents/paise')
    .min(0, 'Subtotal cannot be negative'),
});

export type ValidateCouponInput = z.infer<typeof ValidateCouponSchema>;

// Verified coupon return payload
export type ValidatedCouponResult = {
  code: string;
  discountType: 'flat' | 'percentage';
  discountValue: number;
  discountAmount: number; // Final calculated discount in integer cents / paise
  newSubtotal: number;
};