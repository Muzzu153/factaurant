import type { TenantScope } from '@/core/db/tenant-scope';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { r2Client } from '../../core/runtime/s3';
import { env } from '../../core/runtime/env.server';
import type { GetPresignedUrlInput, CreateProductInput } from './admin.schema';

export const adminService = {
  getRecentOrders: async (db: TenantScope) => {
    return await db.orders.findMany();
  },

  // ⚡ GENERATE TIME-LIMITED S3/R2 PRESIGNED UPLOAD URL
  generateUploadUrl: async (tenantId: string, input: GetPresignedUrlInput) => {
    // 1. Extract file extension (e.g. "photo.jpg" -> "jpg")
    const extension = input.fileName.split('.').pop() || 'jpg';
    
    // 2. Generate a collision-proof, tenant-isolated object key
    const uniqueFileId = crypto.randomUUID();
    const objectKey = `tenants/${tenantId}/products/${uniqueFileId}.${extension}`;

    // 3. Construct the S3 PutObject Command
    const command = new PutObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: objectKey,
      ContentType: input.fileType,
      ContentLength: input.fileSize,
    });

    // 4. Cryptographically sign the command with a 5-minute (300s) expiration
    const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn: 300 });

    // 5. Construct the public CDN URL where the image will be read
    // e.g. "https://pub-xxx.r2.dev/tenants/pizza-king-id/products/123.jpg"
    const publicUrl = `${env.R2_PUBLIC_DOMAIN}/${objectKey}`;

    return {
      uploadUrl,  // The temporary PUT target for the browser
      publicUrl,  // The final permanent URL to save in PostgreSQL
      objectKey,  // The unique key inside the R2 bucket
    };
  },

  createProduct: async (db: TenantScope, input: CreateProductInput) => {
    // 🔒 Safe insert: TenantScope forces the authenticated `tenantId`
    const [newProduct] = await db.products.create({
      name: input.name,
      description: input.description ?? '',
      price: input.price, // Stored in integer cents
      imageUrl: input.imageUrl,
      isAvailable: true,
    });

    console.log(`✅ Product created: "${newProduct.name}" ($${newProduct.price / 100})`);
    return newProduct;
  },
};
