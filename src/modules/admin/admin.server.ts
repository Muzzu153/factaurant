import { protectedTenantFn } from '@/core/runtime/serverFns';
import { adminService } from './admin.service';
import { GetPresignedUrlSchema, CreateProductSchema } from './admin.schema';

export const getAdminOrders = protectedTenantFn.handler(async ({ context }) => {
    return adminService.getRecentOrders(context.db)
})

export const getPresignedUploadUrl = protectedTenantFn
  .inputValidator(GetPresignedUrlSchema)
  .handler(async ({ context, data }) => {
    console.log(`🎟️ Generating R2 upload ticket for tenant: ${context.tenant.name}`);
    return await adminService.generateUploadUrl(context.tenant.id, data);
  });

  export const createProduct = protectedTenantFn
  // 🛡️ Guarded by Zod validation
  .inputValidator(CreateProductSchema)
  .handler(async ({ context, data }) => {
    console.log(`📦 Creating menu item for tenant: ${context.tenant.name}`);
    // Passes the scoped database client directly to domain logic
    return await adminService.createProduct(context.db, data);
  });