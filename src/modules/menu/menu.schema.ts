import { z } from 'zod';

export const MenuGridSchema = z.object({
  type: z.literal('menu_grid'),
  props: z.object({
    columns: z.number().default(3).optional(),
  }).strict()
});

export const MenuListSchema = z.object({
  type: z.literal('menu_list'),
  props: z.object({
    rows: z.number().default(5).optional(),
  }).strict() // No special props needed yet
});
