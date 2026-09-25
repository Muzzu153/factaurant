// src/core/utils/image.ts

// 1. Base URL transformation
export function getImageUrl(
  storedUrl: string | null | undefined,
  options?: { w?: number; q?: number }
): string {
  if (!storedUrl) return '/images/placeholder.png';

  try {
    const url = new URL(storedUrl);
    const pathname = url.pathname; // Extracts "/tenants/pizza-king-id/products/abc-123.png"

    const cdnBase = import.meta.env.VITE_CDN_URL || 'https://images.factaurant.com';
    const params = new URLSearchParams();

    if (options?.w) params.set('w', options.w.toString());
    params.set('q', (options?.q ?? 90).toString());

    return `${cdnBase}${pathname}?${params.toString()}`;
  } catch {
    // Fallback if raw relative path or invalid URL was passed
    return storedUrl;
  }
}

// 2. Factaurant Food Presets
export const img = {
  // Storefront & Menu Presets
  card: (url: string | null | undefined) => getImageUrl(url, { w: 700 }),
  hero: (url: string | null | undefined) => getImageUrl(url, { w: 1920 }),
  listThumb: (url: string | null | undefined) => getImageUrl(url, { w: 160 }),
  cartThumb: (url: string | null | undefined) => getImageUrl(url, { w: 120 }),
  
  // Admin & Operations Presets
  adminTableThumb: (url: string | null | undefined) => getImageUrl(url, { w: 80 }),
  adminPreview: (url: string | null | undefined) => getImageUrl(url, { w: 400 }),

  // SEO & Social Sharing
  og: (url: string | null | undefined) => getImageUrl(url, { w: 1200, q: 85 }),
};