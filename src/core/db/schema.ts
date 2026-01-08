import { pgTable, text, uuid, jsonb, timestamp, integer, boolean } from 'drizzle-orm/pg-core'

// 1. Define TYPES FOR TYPESCRIPT INTELLISENSE
export type Block = {
  type: string,
  props: Record<string, any>
}

export type PageLayout = {
  layout: {
    header: string[];
    main: string[];
    footer: string[];
    siderBar?: string[],
  },
  meta?: {
    title: string,
    description: string,
  },
}

// ----- 1. THE TENANT TABLE (The  "Shop Owner") -----
export const tenants = pgTable('tenants', {
  // We use UUIDs (random strings) instead of Numbers (1, 2, 3)
  // because they are harder to guess. You don't want someone accessing /tenant/4.
  id: uuid().defaultRandom().primaryKey(),


  // This is the subdomain like ("pizza-King ")
  // We index it because we look it up on every request.
  slug: text('slug').unique().notNull(),

  // The visible name "Pizza King Inc"
  name: text('name').notNull(),

  // Theme config (The factory logic)
  // Instead of hardcoding colors, we store them as JSON.
  // The frontend will read this and apply CSS variables.
  theme: jsonb('theme').$type<{
    // Colours
    colors: {
      primary: string; // Main brand color
      secondary: string,
      tertiary: string,
      accent: string,
      text: string,
      background: string; // hex code (e.g. #ffffff or #0f0f0f for dark mode)
    }

    // Geometry (The "Vibe")
    borderRadius: {
      xsm: string,
      sm: string,
      md: string,
      lg: string,
      xl: string,
    }

    // typography
    fonts: {
      heading: string; // "Inter", "Playfair Display", "Space Mono"
      body: string;
    },



  }>().notNull(),

  // 2. THE HEADLESS CMS COLUMNS
  // Inventory: All blocks available for this tenant
  // Reusable blocks
  blocks: jsonb('blocks').$type<Record<string, Block>>().notNull(),

 // Blueprint: How blocks are arranged on pages
//  Pages reference blocks 
  pages: jsonb('pages').$type<Record<string, PageLayout>>().notNull(),

  // the layout sytem 
  // layout: jsonb('layout').$type<{
  //   navbar: 'simple' | 'centered' | 'hamburger';
  //   hero: 'simple-text' | 'split-image' | 'video-bg';
  //   productCard: 'minimal' | 'shadow' | 'bordered';
  // }>().notNull()

})

// ---- 2. THE PRODUCT TABLE (The "Menu Itme") ----
export const products = pgTable('products', {
  id: uuid('id').defaultRandom().primaryKey(),

  // The Golden Rule
  // Every product MUST belong to a tenant
  // We use references() to enforce this relationship at the databse level.
  tenantId: uuid('tenantId').references(() => tenants.id).notNull(),

  name: text('name').notNull(),
  description: text('description'),

  // We store money in integers to avoid floating point math errors.
  // 10.99 => 10.99
  price: integer('price').notNull(),

  imageUrl: text('image-url'),
  isAvailable: boolean('is_available').default(true).notNull(),
})


// 1. DEFINE THE SHAPE OF THE JSON
// This creates a contract for what goes inside the 'items' blob.
export type OrderItemSnapshot = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
};


export const orders = pgTable('orders', {
  id: uuid('id').defaultRandom().notNull(),
  tenantId: uuid('tenantId').references(() => tenants.id).notNull(),

  // Who bought it? Guest checkout for MVP
  custormerName: text('customer_name').notNull(),
  customerAddress: text('customer_address').notNull(),


  // What did they buy?
  // Storing the cart items as a JSON blob for simplicity
  // In a huge app, "order_items" will be required, but jSON is fine for now.
  items: jsonb('items').$type<OrderItemSnapshot[]>().notNull(),

  totalAmount: integer('total_amount').notNull(),
  status: text('status').default('pending').notNull(), // pending, cooking, devlivered
  createdAt: timestamp('created_at').defaultNow(),
})
