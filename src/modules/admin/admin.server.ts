import { tenantFn } from '@/core/runtime/serverFns';
import { adminService } from './admin.service';

export const getAdminOrders = tenantFn.handler(async ({ context }) => {
    return adminService(context.db)
})