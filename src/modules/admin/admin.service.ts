// src/modules/admin/admin.service.ts
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { r2Client } from '../../core/runtime/s3';
import { env } from '../../core/runtime/env.server';
import type { TenantScope } from '../../core/db/tenant-scope';
import type { GetPresignedUrlInput, CreateProductInput } from './admin.schema';

export const adminService = {
  getRecentOrders: async (db: TenantScope) => {
    return await db.orders.findMany();
  },

  generateUploadUrl: async (tenantId: string, input: GetPresignedUrlInput) => {
    const extension = input.fileName.split('.').pop() || 'jpg';
    const uniqueFileId = crypto.randomUUID();
    const objectKey = `tenants/${tenantId}/products/${uniqueFileId}.${extension}`;

    const command = new PutObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: objectKey,
      ContentType: input.fileType,
      ContentLength: input.fileSize,
    });

    const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn: 300 });
    const publicUrl = `${env.R2_PUBLIC_DOMAIN}/${objectKey}`;

    return { uploadUrl, publicUrl, objectKey };
  },

  // 🍕 1. CREATE PRODUCT (With Category & Dietary Classification)
  createProduct: async (db: TenantScope, input: CreateProductInput) => {
    const newProduct = await db.products.create({
      name: input.name,
      description: input.description ?? '',
      price: input.price,
      imageUrl: input.imageUrl,
      categoryId: input.categoryId,
      dietaryType: input.dietaryType || 'veg',
      isAvailable: true,
    });

    console.log(`✅ Product created: "${newProduct.name}" (${newProduct.dietaryType})`);
    return newProduct;
  },

  // ⚡ 2. 1-CLICK 86ing (Instant Out-of-Stock Toggle)
  toggleProductAvailability: async (
    db: TenantScope,
    productId: string,
    isAvailable: boolean
  ) => {
    const updated = await db.products.toggleAvailability(productId, isAvailable);
    if (!updated) {
      throw new Error('Product not found or unauthorized.');
    }
    console.log(`🔄 Product ${productId} availability set to: ${isAvailable}`);
    return updated;
  },

  // 📂 3. CATEGORY CREATION
  createCategory: async (
    db: TenantScope,
    input: { name: string; slug: string; displayOrder?: number }
  ) => {
    return await db.categories.create({
      name: input.name,
      slug: input.slug,
      displayOrder: input.displayOrder ?? 0,
      isActive: true,
    });
  },
};