import { describe, test, expect } from 'vitest'
import { createTenantScope } from '../../src/core/db/tenant-scope'
import { tenantMiddleware } from '../../src/modules/tenant/tenant.middleware'

// ✅ 1) Scope must reject missing tenantId
describe('Integration: Guardrails', () => {
  test('createTenantScope throws if tenantId is missing', () => {
    expect(() => createTenantScope('' as any)).toThrow(/tenant id/i)
  })
})
