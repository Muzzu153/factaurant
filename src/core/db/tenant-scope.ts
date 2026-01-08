// app/core/db/tenant-scope.ts
import { eq, desc } from 'drizzle-orm';
import { db } from './client';
import { products, orders, tenants } from './schema';

// This is the "Safe DB" type
export type TenantScope = ReturnType<typeof createTenantScope>;

/**
 * ⚠️ IMPORTANT
 * This scope MUST ONLY be used AFTER tenant resolution.
 * Never import or use this in tenant resolution logic.
 */
export function createTenantScope(tenantId: string) {
    if(!tenantId){
        throw new Error("Tenant ID is required")
    }

  return {
    // 🍕 PRODUCT REPOSITORY
    products: {
      // 1. SAFE READ
      // Developer doesn't need to pass tenantId. It's baked in.
      findMany: async () => {
        return db
          .select()
          .from(products)
          .where(eq(products.tenantId, tenantId));
      },
      
      // 2. SAFE WRITE
      // Developer passes data, we inject the tenantId automatically.
      create: async (data: typeof products.$inferInsert) => {
        return db.insert(products).values({
          ...data,
          tenantId: tenantId, // 🔒 FORCED OVERRIDE
        }).returning();
      }
    },

    // 🛒 ORDER REPOSITORY
    orders: {
      findMany: async () => {
        return db
          .select()
          .from(orders)
          .where(eq(orders.tenantId, tenantId))
          .orderBy(desc(orders.createdAt));
      },
      
      create: async (data: Omit<typeof orders.$inferInsert, 'tenantId'>) => {
        return db.insert(orders).values({
          ...data,
          tenantId: tenantId, // 🔒 FORCED OVERRIDE
        }).returning();
      }    
    },

    self: {
        get: async () => {
            return db.query.tenants.findFirst({
                where: eq(tenants.id, tenantId)
            })
        }
    }
  };
}