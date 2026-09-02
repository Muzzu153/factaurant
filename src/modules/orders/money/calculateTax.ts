import { z } from 'zod'

// export type TaxRegion = 'IN_GST' | 'NO_TAX'
export const TaxRegionSchema = z.enum(['IN_GST', "NO_TAX"])

export type TaxRegion = z.infer<typeof TaxRegionSchema>

const TAX_RATES: Record<TaxRegion, number> = {
    IN_GST: 18,
    NO_TAX: 0,
}

export const TaxCOnfigSchema = z.object({
    region: TaxRegionSchema,
})

// export type TaxConfig = {
//     region: TaxRegion

// }
export type TaxConfig = z.infer<typeof TaxCOnfigSchema>

export const calculateTax = (amount: number, config: TaxConfig): number => {
    if (!Number.isInteger(amount)) {
        throw new Error('Amount must be integer ')
    }

    if (amount < 0) {
        throw new Error('Amount cannot be negative')
    }

    const rate = TAX_RATES[config.region]

    if (rate === undefined) {
        throw new Error(`Unkown tax region: ${config.region}`)
    }

    const tax = Math.floor((amount * rate) / 100)

    return tax
}
