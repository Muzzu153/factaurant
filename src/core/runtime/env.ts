// core/runtime/env.ts
import { z } from 'zod';

const EnvSchema = z.object({
  APP_DEPLOYMENT_MODE: z.enum(['shared', 'single']).default('shared'),
  SINGLE_TENANT_ID: z.uuid().optional(),

  DATABASE_URL: z.url(),

  NODE_ENV: z.enum(['development', 'production']).default('development'),
});

export const env = EnvSchema.parse(process.env);
