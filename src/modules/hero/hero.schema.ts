import { z } from 'zod';

export const HeroVideoSchema = z.object({
  type: z.literal('hero_video'),
  props: z.object({
    videoUrl: z.url().nonempty(),
    heading: z.string().optional().default("Heading"),
    ctaText: z.string().default('Order Now').optional(),
  })
});

export const HeroTextSchema = z.object({
  type: z.literal('hero_text'),
  props: z.object({
    heading: z.string(),
    subheading: z.string().optional(),
  })
});
