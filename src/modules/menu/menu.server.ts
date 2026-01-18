import { tenantFn } from '@/core/runtime/serverFns';
import { getMenuService } from './menu.service';

export const getMenu = tenantFn.handler(async ({ context }) => {
  return getMenuService(context.db);
});
