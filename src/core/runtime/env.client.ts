import {z} from 'zod'

const ClientEnvSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development')
})

export const clientEnv = ClientEnvSchema.parse({
    NODE_ENV: process.env.NODE_ENV
})