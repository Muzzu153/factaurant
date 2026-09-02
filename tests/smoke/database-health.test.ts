// tests/smoke/database-health.test.ts

import { describe, test, expect } from 'vitest'
import { db } from '../../src/core/db/client'
import { products } from '../../src/core/db/schema'
import { sql, eq } from 'drizzle-orm'

describe('Database Health Checks', () => {
  test('database connection works', async () => {
    const startTime = Date.now()
    
    const result = await db.execute(sql`SELECT 1 as health`)
    
    const queryTime = Date.now() - startTime
    
    console.log(`✅ Database connected - ${queryTime}ms`)
    
    expect(result).toBeDefined()
    expect(queryTime).toBeLessThan(1000) // Should connect in under 1 second
  })

  test('tenants table is accessible and has data', async () => {
    const startTime = Date.now()
    
    const allTenants = await db.query.tenants.findMany()
    
    const queryTime = Date.now() - startTime
    
    console.log(`✅ Found ${allTenants.length} tenants - ${queryTime}ms`)
    
    expect(Array.isArray(allTenants)).toBe(true)
    expect(allTenants.length).toBeGreaterThan(0)
    expect(queryTime).toBeLessThan(1000)
  })

  test('all tenants have required fields', async () => {
    const allTenants = await db.query.tenants.findMany()

    for (const tenant of allTenants) {
      expect(tenant.id).toBeDefined()
      expect(tenant.slug).toBeDefined()
      expect(tenant.name).toBeDefined()
      expect(tenant.theme).toBeDefined()
      expect(tenant.blocks).toBeDefined()
      expect(tenant.pages).toBeDefined()
    }
    
    console.log(`✅ All ${allTenants.length} tenants have required fields`)
  })

  test('all tenants have valid theme structure', async () => {
    const allTenants = await db.query.tenants.findMany()

    for (const tenant of allTenants) {
      // Check theme structure
      expect(tenant.theme).toHaveProperty('colors')
      expect(tenant.theme).toHaveProperty('fonts')
      expect(tenant.theme).toHaveProperty('borderRadius')
      
      // Check colors
      expect(tenant.theme.colors).toHaveProperty('primary')
      expect(tenant.theme.colors).toHaveProperty('secondary')
      expect(tenant.theme.colors).toHaveProperty('background')
      
      // Validate hex colors
      expect(tenant.theme.colors.primary).toMatch(/^#?[0-9A-Fa-f]{3,8}$/)
    }
    
    console.log(`✅ All ${allTenants.length} tenants have valid theme structure`)
  })

  test('all tenants have at least one block', async () => {
    const allTenants = await db.query.tenants.findMany()

    for (const tenant of allTenants) {
      const blockCount = Object.keys(tenant.blocks).length
      
      expect(blockCount).toBeGreaterThan(0)
      
      if (blockCount === 0) {
        console.warn(`⚠️  ${tenant.name} has no blocks`)
      }
    }
    
    console.log(`✅ All tenants have blocks defined`)
  })

  test('all tenants have at least one page', async () => {
    const allTenants = await db.query.tenants.findMany()

    for (const tenant of allTenants) {
      const pageCount = Object.keys(tenant.pages).length
      
      expect(pageCount).toBeGreaterThan(0)
      
      if (pageCount === 0) {
        console.warn(`⚠️  ${tenant.name} has no pages`)
      }
    }
    
    console.log(`✅ All tenants have pages defined`)
  })

  test('products exist for each tenant', async () => {
    const allTenants = await db.query.tenants.findMany({
      columns: { id: true, name: true },
    })

    for (const tenant of allTenants) {
      const tenantProducts = await db.query.products.findMany({
        where: eq(products.tenantId, tenant.id),
        limit: 1,
      })

      if (tenantProducts.length === 0) {
        console.warn(`⚠️  ${tenant.name} has no products`)
      }
      
      // Each tenant should have at least 1 product
      expect(tenantProducts.length).toBeGreaterThan(0)
    }
    
    console.log(`✅ All tenants have products`)
  })

  test('database queries are fast', async () => {
    const queries = [
      { name: 'Find all tenants', fn: () => db.query.tenants.findMany({ limit: 10 }) },
      { name: 'Find one tenant', fn: () => db.query.tenants.findFirst() },
      { name: 'Find products', fn: () => db.query.products.findMany({ limit: 10 }) },
    ]

    for (const query of queries) {
      const startTime = Date.now()
      
      await query.fn()
      
      const queryTime = Date.now() - startTime
      
      console.log(`  ${query.name}: ${queryTime}ms`)
      
      expect(queryTime).toBeLessThan(200) // All queries under 200ms
    }
    
    console.log(`✅ All database queries are fast`)
  })
})