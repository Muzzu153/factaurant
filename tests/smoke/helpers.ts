import { env } from "../../src/core/runtime/env.server"

export interface HealthCheckResult {
    tenant: string
    slug: string
    status: 'healthy' | 'unhealthy'
    responseTime: number
    statusCode?: number
    error?: string
}

/**
 * Check if a URL is accessible
 */
export async function checkURL(
    url: string,
    options: { timeout?: number; method?: 'GET' | 'HEAD' } = {}
): Promise<{
    ok: boolean
    status: number
    responseTime: number
    error?: string
}> {
    const { timeout = 5000, method = 'HEAD' } = options
    const startTime = Date.now()

    try {
        const response = await fetch(url, {
            method,
            signal: AbortSignal.timeout(timeout),
            headers: {
                'User-Agent': 'SaaS-Smoke-Test/1.0',
            },
        })

        const responseTime = Date.now() - startTime

        return {
            ok: response.ok,
            status: response.status,
            responseTime,
        }
    } catch (error) {
        const responseTime = Date.now() - startTime

        return {
            ok: false,
            status: 0,
            responseTime,
            error: error instanceof Error ? error.message : String(error),
        }
    }
}

/**
 * Format response time with color coding
 */
export function formatResponseTime(ms: number): string {
    if (ms < 500) return `${ms}ms ⚡`
    if (ms < 1000) return `${ms}ms ✓`
    if (ms < 3000) return `${ms}ms ⚠️`
    return `${ms}ms 🐌`
}

/**
 * Get base URL based on environment
 */
export function getBaseURL(slug: string): string {
    const environment = env.NODE_ENV || 'development'

    if (environment === 'production') {
        return `https://${slug}.com`
    }

    // Development/staging
    return `http://${slug}.localhost:3000`
}

/**
 * Retry a function with exponential backoff
 */
export async function retry<T>(
    fn: () => Promise<T>,
    options: {
        maxRetries?: number
        initialDelay?: number
        maxDelay?: number
    } = {}
): Promise<T> {
    const { maxRetries = 3, initialDelay = 1000, maxDelay = 10000 } = options

    let lastError: Error

    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn()
        } catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error))

            if (i < maxRetries - 1) {
                const delay = Math.min(initialDelay * Math.pow(2, i), maxDelay)
                await new Promise(resolve => setTimeout(resolve, delay))
            }
        }
    }

    throw lastError!
}

export const BASE_URL = process.env.TEST_APP_URL || 'http://localhost:3000';

export async function checkServerAvailable(url: string = BASE_URL): Promise<boolean> {
  try {
    const res = await fetch(url, { method: 'HEAD' });
    return res.ok || res.status === 404 || res.status === 500;
  } catch {
    return false;
  }
}