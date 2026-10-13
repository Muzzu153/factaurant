import { protectedTenantFn } from '@/core/runtime/serverFns';
import { adminService } from './admin.service';
import {
  GetPresignedUrlSchema,
  CreateProductSchema,
  ToggleProductAvailabilitySchema,
  CreateCategorySchema,
} from './admin.schema';

// 1. Fetch Orders (Existing)
export const getAdminOrders = protectedTenantFn.handler(async ({ context }) => {
  return adminService.getRecentOrders(context.db);
});

// 2. Presigned Image Upload (Existing)
export const getPresignedUploadUrl = protectedTenantFn
  .inputValidator(GetPresignedUrlSchema)
  .handler(async ({ context, data }) => {
     console.log(`🎟️ Generating R2 upload ticket for tenant: ${context.tenant.name}`);
    return await adminService.generateUploadUrl(context.tenant.id, data);
  });

// 3. Create Product (Existing)
export const createProduct = protectedTenantFn
  .inputValidator(CreateProductSchema)
  .handler(async ({ context, data }) => {
     console.log(`📦 Creating menu item for tenant: ${context.tenant.name}`);
    return await adminService.createProduct(context.db, data);
  });

// ⚡ 4. 1-CLICK 86ing AVAILABILITY TOGGLE (New!)
export const toggleProductAvailability = protectedTenantFn
  .inputValidator(ToggleProductAvailabilitySchema)
  .handler(async ({ context, data }) => {
    console.log(`🔄 Toggling availability for product: ${data.productId}`);
    return await adminService.toggleProductAvailability(
      context.db,
      data.productId,
      data.isAvailable
    );
  });

// 📂 5. CREATE CATEGORY (New!)
export const createCategory = protectedTenantFn
  .inputValidator(CreateCategorySchema)
  .handler(async ({ context, data }) => {
    console.log(`📂 Creating category for tenant: ${context.tenant.name}`);
    return await adminService.createCategory(context.db, data);
  });