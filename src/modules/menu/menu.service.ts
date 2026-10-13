// src/modules/menu/menu.service.ts
import type { TenantScope } from '../../core/db/tenant-scope';

export const menuService = {
  // 1. Fetch categories for navigation tabs
  getCategories: async (db: TenantScope) => {
    return await db.categories.findMany();
  },

  // 2. Fetch products (with optional category filter)
  getProducts: async (
    db: TenantScope,
    options?: { categoryId?: string; isAvailableOnly?: boolean }
  ) => {
    return await db.products.findMany(options);
  },
};