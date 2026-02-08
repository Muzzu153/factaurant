import { eq, desc, and } from 'drizzle-orm';
import { db } from './client';
import { products, orders, tenants } from './schema';

// This is the "Safe DB" type
export type TenantScope = ReturnType<typeof createTenantScope>;

/**
 * IMPORTANT
 * This scope MUST ONLY be used AFTER tenant resolution.
 * Never import or use this in tenant resolution logic.
 */
export function createTenantScope(tenantId: string) {
  if (!tenantId) {
    throw new Error("Tenant ID is required")
  }

  return {
    // PRODUCT REPOSITORY
    products: {
      // 1. SAFE READ
      // Developer doesn't need to pass tenantId. It's baked in.
      findMany: async () => {
        const allProducts = await db
          .select()
          .from(products)
          .where(eq(products.tenantId, tenantId));

        return allProducts
      },

      // 2. SAFE WRITE
      // Developer passes data, we inject the tenantId automatically.
      create: async (data: Omit<typeof products.$inferInsert, "tenantId">) => {
        const created = await db
          .insert(products)
          .values({
            ...data,
            tenantId: tenantId, // FORCED OVERRIDE
          }).returning();

        return created
      },

      update: async (id: string, data: Partial<Omit<typeof products.$inferInsert, "tenantId" | "id" | "createdAt">>) => {
        const updated = await db
          .update(products)
          .set({
            ...data,
            tenantId: tenantId  // FORCED OVERRIDE
          })
          .where(
            and(
              eq(products.id, id),
              eq(products.tenantId, tenantId),
            )
          )
          .returning()

        return updated
      },

      delete: async (id: string) => {
        const deleted = await db
          .delete(products)
          .where(
            and(
              eq(products.id, id),
              eq(products.tenantId, tenantId),
            )
          )
          .returning()

        return deleted
      },

    },

    // ORDER REPOSITORY
    orders: {
      findMany: async () => {
        const allOrder = await db
          .select()
          .from(orders)
          .where(eq(orders.tenantId, tenantId))
          .orderBy(desc(orders.createdAt));

        return allOrder
      },

      create: async (data: Omit<typeof orders.$inferInsert, 'tenantId'>) => {
        const created = await db
          .insert(orders)
          .values({
            ...data,
            tenantId: tenantId, //  FORCED OVERRIDE
          }).returning();

        return created
      },

      updateStatus: async (id: string, status: string) => {
        const updated = await db
          .update(orders)
          .set({ status, })
          .where(
            and(
              eq(orders.id, id),
              eq(orders.tenantId, tenantId),
            )
          )
          .returning()

        return updated
      },

      delete: async (id: string) => {
        const deleted = await db
          .delete(orders)
          .where(
            and(
              eq(orders.id, id),
              eq(orders.tenantId, tenantId),
            )
          )
          .returning()

        return deleted
      },

    },

    self: {
      get: async () => {
        const tenant = await db
          .query
          .tenants
          .findFirst({
            where: eq(tenants.id, tenantId)
          })

        return tenant
      }
    }
  };
}