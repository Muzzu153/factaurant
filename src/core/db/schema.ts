import { pgTable, text, uuid, jsonb, timestamp, integer, boolean } from 'drizzle-orm/pg-core'

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
    primaryColor: string; // Main brand color
    background: string; // hex code (e.g. #ffffff or #0f0f0f for dark mode)

    // Geometry (The "Vibe")
    radius: string;  // "0rem" (Sharp), "0.5rem" (Standard), "2rem" (Round)

    // typography
    fontHeading: string; // "Inter", "Playfair Display", "Space Mono"
    fontBody: string;
  }>().notNull(),

  // the layout sytem 
  layout: jsonb('layout').$type<{
    navbar: 'simple' | 'centered' | 'hamburger';
    hero: 'simple-text' | 'split-image' | 'video-bg';
    productCard: 'minimal' | 'shadow' | 'bordered';
  }>().notNull()

})

// ---- 2. THE PRODUCT TABLE (The "Menu Itme") ----
export const products = pgTable('products',{
  id: uuid('id').defaultRandom().primaryKey(),

  // The Golden Rule
  // Every product MUST belong to a tenant
  // We use references() to enforce this relationship at the databse level.
  tenantId: uuid('tenantId').references(()=> tenants.id).notNull(),

  name: text('name').notNull(),
  description: text('description'),

  // We store money in integers to avoid floating point math errors.
  // 10.99 => 10.99
  price: integer('price').notNull(),

  imageUrl: text('image-url'),
  isAvailable: boolean('is_available').default(true).notNull(),
})


export const orders = pgTable('orders', {
  id: uuid('id').defaultRandom().notNull(),
  tenantId: uuid('tenantId').references(()=>tenants.id).notNull(),

  // Who bought it? Guest checkout for MVP
  custormerName: text('customer_name').notNull(),
  customerAddress: text('customer_address').notNull(),


  // What did they buy?
  // Storing the cart items as a JSON blob for simplicity
  // In a huge app, "order_items" will be required, but jSON is fine for now.
  items: jsonb('items').notNull(),

  totalAmount: integer('total_amount').notNull(),
  status: text('status').default('pending'), // pending, cooking, devlivered
  createdAt: timestamp('created_at').defaultNow(),
})
