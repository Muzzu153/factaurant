import { z } from 'zod'

export const LayoutSchema = z.object({
    header: z.array(z.string()),
    main: z.array(z.string()),
    footer: z.array(z.string()),
    sidebar: z.array(z.string()).optional(),
})

export const PageLayoutSchema = z.object({
    layout: LayoutSchema,
    meta: z.object({
        title: z.string().optional(),
        description: z.string().optional(),
    }).optional(),
})

export type Layout = z.infer<typeof LayoutSchema>
export type PageLayout = z.infer<typeof PageLayoutSchema> 
