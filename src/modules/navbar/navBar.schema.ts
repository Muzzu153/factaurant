import { z } from 'zod'

export const NavSimpleSchema = z.object({ type: z.literal('navbar_simple'), props: z.object({}) });