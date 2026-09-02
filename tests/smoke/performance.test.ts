// tests/smoke/performance.test.ts

import { describe, test, expect } from 'vitest'
import { db } from '../../src/core/db/client'
import { checkURL, getBaseURL, formatResponseTime } from './helpers'

describe('Performance Smoke Tests', () => {
  test('homepage loads in acceptable time', async () => {
    // Get first tenant
    const tenant = await db.query.tenants.findFirst({
      columns: { slug: true, name: true },
    })

    if (!tenant) {
      throw new Error('No tenants found')
    }

    const url = getBaseURL(tenant.slug)
    const result = await checkURL(url, { method: 'GET' })

    console.log(`📊 ${tenant.name} homepage: ${formatResponseTime(result.responseTime)}`)

    expect(result.ok).toBe(true)
    expect(result.responseTime).toBeLessThan(3000) // Under 3 seconds
  })

//   test('API responds quickly', async () => {
//     const tenant = await db.query.tenants.findFirst({
//       columns: { slug: true, name: true },
//     })

//     if (!tenant) {
//       throw new Error('No tenants found')
//     }

//     const url = `${getBaseURL(tenant.slug)}/admin`
//     console.log(url)
//     const result = await checkAPI(url)
//     console.log(result)

//     console.log(`📊 ${tenant.name} API: ${formatResponseTime(result.responseTime)}`)

//     expect(result.ok).toBe(true)
//     expect(result.responseTime).toBeLessThan(500) // Under 500ms
//   })

  test('database queries are fast', async () => {
    const startTime = Date.now()

    await db.query.products.findMany({ limit: 10 })

    const queryTime = Date.now() - startTime

    console.log(`📊 Database query: ${formatResponseTime(queryTime)}`)

    expect(queryTime).toBeLessThan(100) // Under 100ms
  })

  test('concurrent requests handle well', async () => {
    const tenant = await db.query.tenants.findFirst({
      columns: { slug: true },
    })

    if (!tenant) return

    const url = getBaseURL(tenant.slug)

    // Make 10 concurrent requests
    const startTime = Date.now()
    
    const results = await Promise.all(
      Array.from({ length: 10 }, () => checkURL(url))
    )
    
    const totalTime = Date.now() - startTime
    const avgTime = totalTime / 10

    console.log(`📊 10 concurrent requests: ${totalTime}ms total, ${avgTime.toFixed(0)}ms avg`)

    // All should succeed
    expect(results.every(r => r.ok)).toBe(true)
    
    // Average should be reasonable
    expect(avgTime).toBeLessThan(1000)
  })
})