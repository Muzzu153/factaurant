import { eq, desc, and, sql } from 'drizzle-orm';
import { db } from './client';
import { products, orders, tenants, users } from './schema';

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

  // 🔒 Reusable session transaction helper
  const withTenantSession = async <T>(callback: (tx: typeof db) => Promise<T>): Promise<T> => {
    return await db.transaction(async (tx: any) => {
      // ⚡ Sets PostgreSQL Session Variable so RLS policy on products allows reading!
      await tx.execute(sql`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`);
      return await callback(tx);
    });
  };


  return {
    // PRODUCT REPOSITORY
    products: {
      findMany: async () => {
        // ⚡ MUST use withTenantSession so PostgreSQL RLS engine sees app.current_tenant_id!
        return withTenantSession(async (tx) => {
          return await tx
            .select()
            .from(products)
            .where(eq(products.tenantId, tenantId));
        });
      },

      create: async (data: Omit<typeof products.$inferInsert, 'tenantId'>) => {
        return withTenantSession(async (tx) => {
          return await tx.insert(products).values({ ...data, tenantId }).returning();
        });
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
        return withTenantSession(async (tx) => {
          return await tx
            .select()
            .from(orders)
            .where(eq(orders.tenantId, tenantId))
            .orderBy(desc(orders.createdAt));
        });
      },
      // ⚡ FIX: Must use withTenantSession and `tx.insert` so RLS WITH CHECK passes!
      create: async (data: Omit<typeof orders.$inferInsert, 'tenantId'>) => {
        return withTenantSession(async (tx) => {
          return await tx
            .insert(orders)
            .values({ ...data, tenantId })
            .returning();
        });
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


    // 👤 USERS REPOSITORY
    users: {
      findByEmail: async (email: string) => {
        return withTenantSession(async (tx) => {
          const [foundUser] = await tx
            .select()
            .from(users)
            .where(
              and(
                eq(users.tenantId, tenantId),
                eq(users.email, email.toLowerCase().trim())
              )
            );
          return foundUser || null;
        });
      },
      create: async (data: Omit<typeof users.$inferInsert, 'tenantId'>) => {
        return withTenantSession(async (tx) => {
          // ⚡ Destructure [createdUser] from the .returning() array
          const [createdUser] = await tx
            .insert(users)
            .values({
              ...data,
              email: data.email.toLowerCase().trim(),
              tenantId,
            })
            .returning();
          return createdUser;
        });
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