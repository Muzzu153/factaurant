import type { TenantScope } from '@/core/db/tenant-scope';

export async function adminService(db: TenantScope) {
  return db.orders.findMany();
}
