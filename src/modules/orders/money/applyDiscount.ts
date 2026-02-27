import { z } from 'zod'

export const PercentageDiscountSchema = z.object({
    type: z.literal('percentage'),
    value: z.number()
})

export const FixedDiscountSchema = z.object({
    type: z.literal('fixed'),
    value: z.number(),
})


export type PercentageDiscount = z.infer<typeof PercentageDiscountSchema>
export type FixedDiscount = z.infer<typeof FixedDiscountSchema>


export const DiscountSchema = z.discriminatedUnion('type', [
    PercentageDiscountSchema,
    FixedDiscountSchema
])

export type Discount = z.infer<typeof DiscountSchema>
// export type Discount = FixedDiscount | PercentageDiscount

// src/core/money/applyDiscount.ts
export function applyDiscount(total: number, discount?: Discount): number {
    if (total < 0) {
        throw new Error('Total cannot be negative')
    }

    if (!discount) {
        return total
    }

    let discountedTotal = total

    if (discount.type === 'percentage') {
        if (discount.value < 0 || discount.value > 100) {
            throw new Error('Invalid percentage discount')
        }

        const discountAmount = Math.floor(
            (total * discount.value) / 100
        )

        discountedTotal = total - discountAmount
    }

    if (discount.type === 'fixed') {
        if (discount.value < 0) {
            throw new Error('Invalid fixed discount')
        }

        discountedTotal = total - discount.value
    }

    // 🔒 Clamp — total can NEVER be negative
    return Math.max(0, discountedTotal)
}

export const formatPrice = () => {

}
