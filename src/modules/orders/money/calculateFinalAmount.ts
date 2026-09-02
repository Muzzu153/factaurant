import { CartItemSchema } from "../order.schema";
import { calculateCartTotal } from "./calculateCartTotal";
import { calculateTax, TaxCOnfigSchema } from "./calculateTax";
import { applyDiscount, DiscountSchema } from "./applyDiscount";
import { z } from 'zod'

export const FInalAmountSchema = z.object({
    items: z.array(CartItemSchema),
    discount: DiscountSchema.optional(),
    tax: TaxCOnfigSchema,
})

export type FinalAmount = z.infer<typeof FInalAmountSchema>

const FinalAmountBreakdownSchema = z.object({
    subtotal: z.number(),
    discountAmount: z.number(),
    taxAmount: z.number(),
    totalPayable: z.number(),
})

export type FinalAmountBreakdown = z.infer<typeof FinalAmountBreakdownSchema>

export function calculateFinalAmount(
    input: FinalAmount
): FinalAmountBreakdown {
    const subtotal = calculateCartTotal(input.items)

    const afterDiscount = applyDiscount(subtotal, input.discount)

    const taxAmount = calculateTax(afterDiscount, input.tax)

    const totalPayable = afterDiscount + taxAmount

    if (totalPayable < 0) {
        throw new Error('Final payable cannot be negative')
    }

    return {
        subtotal,
        discountAmount: subtotal - afterDiscount,
        taxAmount,
        totalPayable,
    }
}
