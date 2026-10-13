import { z } from "zod";

export const CartItemSchema = z.object({
  productId: z.string().optional(),
  name: z.string().optional(),
  price: z.number().min(0), // We validate price format, though in real apps we'd refetch from DB
  imageUrl: z.url().nullable().optional(),
  quantity: z.number()
    .min(1, 'Must order atleast one item')
    .max(20, 'More than 20 items cannot be ordered together')
    .int('Quantity must be a whole number'),
})

export type CartItem = z.infer<typeof CartItemSchema>
