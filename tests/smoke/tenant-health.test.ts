import { describe, test, expect } from 'vitest'
import { db } from '../../src/core/db/client'

describe('Tenant Health Checks', async () => {
    let tenants: Array<{ slug: string; name: string }>

    // Fetch all tenants once
    tenants = await db.query.tenants.findMany({
        columns: { slug: true, name: true },
    })

    console.log(`🔍 Testing ${tenants.length} tenants...`)

    for (const tenant of tenants) {
        test(`${tenant.name} homepage is accessible`, async () => {
            const failures: string[] = []
            const startTime = Date.now()

            try {
                const response = await fetch(`http://${tenant.slug}.localhost:3000`, {
                    method: 'HEAD', // Just headers, no body download
                    signal: AbortSignal.timeout(5000), // 5 second timeout
                })

                const responseTime = Date.now() - startTime

                if (!response.ok || response.status !== 200) {
                    failures.push(
                        `${tenant.name} (${tenant.slug}) → HTTP ${response.status}`
                    )
                    // continue
                }

                if (responseTime > 3000) {
                    failures.push(
                        `${tenant.name} (${tenant.slug}) → slow response (${responseTime}ms)`
                    )
                }
                // Assertions
                expect(response.ok).toBe(true)
                expect(response.status).toBe(200)
                expect(responseTime).toBeLessThan(3000) // Under 3 seconds

                console.log(`${response.ok ? '✅' : '❌'} ${tenant.name} - ${responseTime}ms`)
            }

            catch (err: any) {
                failures.push(`${tenant.name} (${tenant.slug} → ${err.message}`
                )
            }




        }
        )
    }
})