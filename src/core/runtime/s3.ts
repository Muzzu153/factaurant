import { S3Client } from '@aws-sdk/client-s3';
import { env } from './env.server';

// 1. INITIALIZE S3 CLIENT FOR CLOUDFLARE R2
// Cloudflare R2 is 100% S3-compatible, but requires:
// - custom endpoint pointing to your Account ID
// - region set to 'auto'
export const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  },
});