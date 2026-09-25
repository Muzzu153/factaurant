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
    errorMap: () => ({ message: 'Invalid file type. Only JPG, PNG, WebP, and AVIF are allowed.' }),
  }),
  fileSize: z
    .number()
    .int()
    .positive()
    .max(MAX_FILE_SIZE, 'File size exceeds maximum limit of 5MB'),
});

export type GetPresignedUrlInput = z.infer<typeof GetPresignedUrlSchema>;

// ... Keep ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE, and GetPresignedUrlSchema ...

// 4. SCHEMA FOR CREATING A PRODUCT
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
    .int('Price must be an integer in cents (e.g. 1499 for $14.99)')
    .positive('Price must be greater than zero'),
  imageUrl: z
    .string()
    .url('A valid image URL is required'),
});

export type CreateProductInput = z.infer<typeof CreateProductSchema>;