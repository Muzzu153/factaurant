import { z } from 'zod'

export const CartItemSchema = z.object({
  productId: z.string().optional(),
  name: z.string().optional(),
  price: z.number().min(0), // We validate price format, though in real apps we'd refetch from DB
  imageUrl: z.url().nullable().optional(),
  quantity: z.number()
            .min(1, 'Must order atleast one item')
            .max(20,'More than 20 items cannot be ordered together')
            .int('Quantity must be a whole number'),
})

// 1. DEFINE THE VALIDATION SCHEMA (The Firewall)
export const OrderInputSchema = z.object({
  customerName: z.string().min(2, 'Name must be at least 2 characters'),
  customerAddress: z.string().min(5, 'Address must be at least 5 characters'),
  items: z.array(CartItemSchema).min(1, 'Cart cannot be empty'),
})

// Type inference for usage in frontend forms
export type OrderInput = z.infer<typeof OrderInputSchema>
export type CartItem = z.infer<typeof CartItemSchema>
