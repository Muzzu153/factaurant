// src/modules/orders/coupon.service.ts
import type { TenantScope } from '@/core/db/tenant-scope';
import type { ValidateCouponInput, ValidatedCouponResult } from './coupon.schema';

const formatPrice = (cents: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(cents / 100);

export const couponService = {
  validate: async (db: TenantScope, input: ValidateCouponInput): Promise<ValidatedCouponResult> => {
    const normalizedCode = input.code.toUpperCase().trim();

    // 1. Look up coupon strictly within tenant scope
    const coupon = await db.coupons.findByCode(normalizedCode);

    if (!coupon) {
      throw new Error(`Invalid coupon code "${normalizedCode}".`);
    }

    // 2. Check expiration date
    if (coupon.expiresAt && new Date(coupon.expiresAt).getTime() < Date.now()) {
      throw new Error(`Coupon "${normalizedCode}" has expired.`);
    }

    // 3. Check minimum order threshold
    if (input.subtotal < coupon.minOrderAmount) {
      throw new Error(
        `Minimum order of ${formatPrice(coupon.minOrderAmount)} required to use coupon "${normalizedCode}".`
      );
    }

    // 4. Calculate discount amount in integer cents / paise
    let discountAmount = 0;

    if (coupon.discountType === 'flat') {
      // Flat discount (e.g. flat Rs 50 off) capped at total subtotal
      discountAmount = Math.min(coupon.discountValue, input.subtotal);
    } else if (coupon.discountType === 'percentage') {
      // Percentage discount (e.g. 20% off)
      const rawDiscount = Math.round((input.subtotal * coupon.discountValue) / 100);

      // Apply optional maximum discount cap if configured
      if (coupon.maxDiscountAmount && coupon.maxDiscountAmount > 0) {
        discountAmount = Math.min(rawDiscount, coupon.maxDiscountAmount);
      } else {
        discountAmount = rawDiscount;
      }

      // Ensure discount never exceeds total subtotal
      discountAmount = Math.min(discountAmount, input.subtotal);
    }

    const newSubtotal = Math.max(0, input.subtotal - discountAmount);

    return {
      code: coupon.code,
      discountType: coupon.discountType as 'flat' | 'percentage',
      discountValue: coupon.discountValue,
      discountAmount,
      newSubtotal,
    };
  },
};