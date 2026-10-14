// src/modules/menu/menu.service.ts
import type { TenantScope } from '../../core/db/tenant-scope';
import type { Product, Category, ModifierGroup } from '@/core/db/schema';

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

export function getEffectiveModifierGroups(
  product: Product,
  category?: Category | null,
  globalGroups: ModifierGroup[] = []
): ModifierGroup[] {
  const categoryGroups = (category?.modifierGroups as ModifierGroup[]) || [];
  const productGroups = (product.modifierGroups as ModifierGroup[]) || [];

  // Combine store-wide, category-wide, and item-specific groups in natural order
  return [
    ...globalGroups,
    ...categoryGroups,
    ...productGroups,
  ];
}