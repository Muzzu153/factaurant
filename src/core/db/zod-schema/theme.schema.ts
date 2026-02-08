import { z } from 'zod'

export const cssSize = z.string().regex(
    /^\d+(\.\d+)?(px|rem|em|%|vw|vh|ch|ex|cm|mm|in|pt|pc)$/,
    'Must be a valid CSS size (e.g., "4px", "10%", "2rem", "0.5em")'
)


export const ThemeSchema = z.object({
    colors: z.object({
        primary: z.string(),
        secondary: z.string(),
        tertiary: z.string(),
        accent: z.string(),
        text: z.string(),
        background: z.string(),
    }),

    borderRadius: z.object({
        xsm: cssSize,
        sm: cssSize,
        md: cssSize,
        lg: cssSize,
        xl: cssSize,
        xlg: cssSize,
    }),

    fonts: z.object({
        heading: z.string(),
        body: z.string(),
    })
})

export type Theme = z.infer<typeof ThemeSchema>