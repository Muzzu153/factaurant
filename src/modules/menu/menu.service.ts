// modules/menu/menu.service.ts
import type { TenantScope } from '@/core/db/tenant-scope';

export async function getMenuService(db: TenantScope) {
  return db.products.findMany();
}
