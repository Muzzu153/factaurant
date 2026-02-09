import { z } from 'zod'

const ServerEnvSchema = z.object({
  APP_DEPLOYMENT_MODE: z.enum(['shared', 'single']).default('shared'),
  SINGLE_TENANT_ID: z.uuid().optional(),

  DATABASE_URL: z.url(),

  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
})

export const env = ServerEnvSchema.parse(process.env)
