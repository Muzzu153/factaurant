import { z } from 'zod'

const ServerEnvSchema = z.object({
  APP_DEPLOYMENT_MODE: z.enum(['shared', 'single']).default('shared'),

  DATABASE_URL: z.url(),

  SINGLE_TENANT_ID: z
    .string()
    .optional()
    .or(z.literal(''))
    .transform((val) => (val === '' ? undefined : val)),

  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),

  VITE_CDN_URL: z
    .string()
    .url()
    .optional()
    .or(z.literal(''))
    .transform((val) => (val === '' ? undefined : val)),


  // R2 Environment Validation
  R2_ACCOUNT_ID: z.string().min(1, 'R2_ACCOUNT_ID is required').optional(),
  R2_ACCESS_KEY_ID: z.string().min(1, 'R2_ACCESS_KEY_ID is required').optional(),
  R2_SECRET_ACCESS_KEY: z.string().min(1, 'R2_SECRET_ACCESS_KEY is required').optional(),
  R2_BUCKET_NAME: z.string().min(1, 'R2_BUCKET_NAME is required').optional(),
  R2_PUBLIC_DOMAIN: z.url('R2_PUBLIC_DOMAIN must be a valid URL (e.g. https://pub-xxx.r2.dev)').optional(),
})

// export const env = ServerEnvSchema.parse(process.env)

// Parse and validate environment variables
const parsed = ServerEnvSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid Server Environment Variables:', z.treeifyError(parsed.error))
  throw new Error('Invalid Server Environment Variables');
}

export const env = parsed.data;
