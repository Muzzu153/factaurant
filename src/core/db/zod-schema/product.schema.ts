import { z } from 'zod'

const ProductSchema = z.object({
    id: z.uuid(),
    tenantId: z.uuid(),
    name: z.string(),
    description: z.string().optional().nullable(),
    price: z.number(),
    imageUrl: z.url().optional().nullable(),
    isAvailable: z.boolean(),
})

export type Product = z.infer<typeof ProductSchema> 
