// src/modules/menu/menu.server.ts
import { tenantFn } from '@/core/runtime/serverFns';
import { menuService } from './menu.service';

//  Fetch Menu for Storefront
export const getMenu = tenantFn.handler(async ({ context }) => {
  // Call menuService.getProducts
  return await menuService.getProducts(context.db);
});

//  Fetch Categories for Navigation Tabs
export const getCategories = tenantFn.handler(async ({ context }) => {
  return await menuService.getCategories(context.db);
});