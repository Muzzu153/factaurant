import { z } from 'zod'

const ProductSchema = z.object({
    id: z.uuid(),
    tenantId: z.uuid(),
    name: z.string(),
    description: z.string().optional(),
    price: z.number(),
    imageUrl: z.url().optional(),
    isAvailable: z.boolean(),
})

export type Product = z.infer<typeof ProductSchema> 
