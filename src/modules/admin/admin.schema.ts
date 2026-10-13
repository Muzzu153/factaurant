import { z } from 'zod';

// 1. ALLOWED IMAGE MIME TYPES
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
] as const;

// 2. MAX FILE SIZE (5MB in bytes)
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

// 3. SCHEMA FOR REQUESTING AN UPLOAD TICKET
export const GetPresignedUrlSchema = z.object({
  fileName: z.string().min(1, 'File name is required'),
  fileType: z.enum(ALLOWED_IMAGE_TYPES, {
    message: 'Invalid file type. Only JPG, PNG, WebP, and AVIF are allowed.',
  }),
  fileSize: z
    .number()
    .int()
    .positive()
    .max(MAX_FILE_SIZE, 'File size exceeds maximum limit of 5MB'),
});

export type GetPresignedUrlInput = z.infer<typeof GetPresignedUrlSchema>;

// 🟢 4. DIETARY CLASSIFICATION ENUM
export const DIETARY_TYPES = ['veg', 'non_veg', 'contains_egg', 'vegan'] as const;

// 🍕 5. SCHEMA FOR CREATING A PRODUCT (Updated with categoryId & dietaryType!)
export const CreateProductSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Product name must be at least 2 characters')
    .max(100, 'Product name cannot exceed 100 characters'),
  description: z
    .string()
    .trim()
    .max(500, 'Description cannot exceed 500 characters')
    .optional(),
  price: z
    .number()
    .int('Price must be an integer in cents/paise (e.g. 1499 for $14.99 / ₹14.99)')
    .positive('Price must be greater than zero'),
  imageUrl: z
    .string()
    .url('A valid image URL is required'),
  // ⚡ New Fields:
  categoryId: z
    .string()
    .uuid('Invalid category ID')
    .optional(),
  dietaryType: z
    .enum(DIETARY_TYPES)
    .default('veg'),
});

export type CreateProductInput = z.infer<typeof CreateProductSchema>;

// ... keep existing schemas (GetPresignedUrlSchema, CreateProductSchema) ...

// ⚡ 6. SCHEMA FOR 1-CLICK AVAILABILITY TOGGLE (86ing)
export const ToggleProductAvailabilitySchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  isAvailable: z.boolean(),
});

export type ToggleProductAvailabilityInput = z.infer<typeof ToggleProductAvailabilitySchema>;

// 📂 7. SCHEMA FOR CREATING A CATEGORY
export const CreateCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Category name must be at least 2 characters')
    .max(50, 'Category name cannot exceed 50 characters'),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(2, 'Slug must be at least 2 characters')
    .max(50, 'Slug cannot exceed 50 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  displayOrder: z
    .number()
    .int()
    .default(0),
});

export type CreateCategoryInput = z.infer<typeof CreateCategorySchema>;