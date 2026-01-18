import { z } from 'zod'

export const FooterSimpleSchema = z.object({
    type: z.literal('footer_simple'),
    props: z.object({ text: z.string() })
});