import {
  pgTable,
  text,
  uuid,
  integer,
  jsonb,
  boolean,
  timestamp,
  uniqueIndex,
  pgPolicy,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// 1. MODIFIER & CUSTOMIZATION TYPES
export type ModifierOption = {
  id: string;
  name: string;
  price: number; // Additional price in integer cents / paise
  isDefault?: boolean;
};

export type ModifierGroup = {
  id: string;
  name: string; // e.g., "Select Size", "Crust Choice", "Extra Add-ons"
  minSelection: number; // 1 for mandatory single-choice (radio), 0 for optional
  maxSelection: number; // 1 for single-choice (radio), >1 for multi-choice (checkbox)
  options: ModifierOption[];
};

export type SelectedModifier = {
  groupId: string;
  groupName: string;
  optionId: string;
  optionName: string;
  price: number; // Price of this specific modifier in cents / paise
};

// 1. Define TYPES FOR TYPESCRIPT INTELLISENSE
export type Block = {
  type: string;
  props: Record<string, any>;
};

export type PageLayout = {
  layout: {
    header: string[];
    main: string[];
    footer: string[];
    siderBar?: string[];
  };
  meta?: {
    title: string;
    description: string;
  };
};

//  EXISTING CHECKOUT ITEM TYPE

// ⚡ Define CartItem directly in core so schema never depends on modules/orders
export type CartItem = {
  productId: string;
  name: string;
  basePrice: number; // Base product price in cents / paise
  price: number; // Total unit price (basePrice + all selected modifier prices)
  quantity: number;
  imageUrl?: string | null;
   selectedModifiers?: SelectedModifier[];
  itemInstructions?: string; // Special customer cooking instructions
};

// ==============================================================================
// 🛡️ REUSABLE MULTI-TENANT POLICY FACTORY
// ==============================================================================
export function createMultiTenantPolicies(tableName: string) {
  return [
    pgPolicy(`postgres_admin_${tableName}_all`, {
      for: 'all',
      to: 'postgres',
      using: sql`true`,
      withCheck: sql`true`,
    }),
    pgPolicy(`factaurant_app_${tableName}_isolation`, {
      for: 'all',
      to: 'factaurant_app',
      using: sql`tenant_id = nullif(current_setting('app.current_tenant_id', true), '')::uuid`,
      withCheck: sql`tenant_id = nullif(current_setting('app.current_tenant_id', true), '')::uuid`,
    }),
    pgPolicy(`smoke_reader_can_read_${tableName}`, {
      for: 'select',
      to: 'smoke_reader',
      using: sql`true`,
    }),
  ];
}

// ==============================================================================
// 1. THE TENANT TABLE (Public Storefront Directory - No tenant_id column!)
// ==============================================================================
export const tenants = pgTable(
  'tenants',
  {
    // Explicit 'id' column name to match the rest of the schema
    id: uuid('id').defaultRandom().primaryKey(),
    slug: text('slug').unique().notNull(),
    name: text('name').notNull(),
    theme: jsonb('theme').$type<{
      colors: {
        primary: string;
        secondary: string;
        tertiary: string;
        accent: string;
        text: string;
        background: string;
      };
      borderRadius: {
        xsm: string;
        sm: string;
        md: string;
        lg: string;
        xl: string;
      };
      fonts: {
        heading: string;
        body: string;
      };
    }>().notNull(),
    blocks: jsonb('blocks').$type<Record<string, Block>>().notNull(),
    pages: jsonb('pages').$type<Record<string, PageLayout>>().notNull(),
    globalModifierGroups: jsonb('global_modifier_groups').$type<ModifierGroup[]>().default([]).notNull(),
  },
  (table) => [
    // 👑 Admin has full control
    pgPolicy('postgres_admin_tenants_all', {
      for: 'all',
      to: 'postgres',
      using: sql`true`,
      withCheck: sql`true`,
    }),
    // 🌐 Web app runtime can READ tenants by slug to resolve brand & theme
    pgPolicy('factaurant_app_read_tenants', {
      for: 'select',
      to: 'factaurant_app',
      using: sql`true`,
    }),
    // 🛡️ Smoke test runner can read tenants
    pgPolicy('smoke_reader_can_read_tenants', {
      for: 'select',
      to: 'smoke_reader',
      using: sql`true`,
    }),
  ]
).enableRLS();

// ==============================================================================
// 2. CATEGORIES TABLE (New!)
// ==============================================================================
export const categories = pgTable(
  'categories',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id')
      .references(() => tenants.id, { onDelete: 'cascade' })
      .notNull(),
    name: text('name').notNull(), // e.g. "Wood-Fired Pizzas"
    slug: text('slug').notNull(), // e.g. "pizzas"
    displayOrder: integer('display_order').default(0).notNull(), // Sequence in tabs
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    modifierGroups: jsonb('modifier_groups').$type<ModifierGroup[]>().default([]).notNull(),
  },
  (table) => [
    uniqueIndex('tenant_category_slug_idx').on(table.tenantId, table.slug),
    // ⚡ Inherits full multi-tenant RLS in one line!
    ...createMultiTenantPolicies('categories'),
  ]
).enableRLS();

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;

// ==============================================================================
// 3. PRODUCTS TABLE (Updated with categoryId & dietaryType!)
// ==============================================================================
export const products = pgTable(
  'products',
  {
    id: uuid('id').primaryKey().defaultRandom().notNull(),
    tenantId: uuid('tenant_id')
      .references(() => tenants.id, { onDelete: 'cascade' })
      .notNull(),
      
    // 🔗 Foreign key to Category (optional so unassigned items don't break)
    categoryId: uuid('category_id').references(() => categories.id, {
      onDelete: 'set null',
    }),

    name: text('name').notNull(),
    description: text('description'),
    price: integer('price').notNull(), // In integer paise / cents
    imageUrl: text('image_url'),

    // 🟢 DIETARY TYPE (FSSAI Standard for Indian Food Businesses)
    dietaryType: text('dietary_type', {
      enum: ['veg', 'non_veg', 'contains_egg', 'vegan'],
    })
      .default('veg')
      .notNull(),

    // ⚡ 1-Click Availability (86ing items)
    isAvailable: boolean('is_available').default(true).notNull(),

    modifierGroups: jsonb('modifier_groups').$type<ModifierGroup[]>().default([]).notNull(),
  },
  (table) => [
    ...createMultiTenantPolicies('products'),
  ]
).enableRLS();

export type Product = typeof products.$inferSelect;

// ==============================================================================
// 3. THE ORDERS TABLE (Uses Multi-Tenant Policy Helper)
// ==============================================================================
export const orders = pgTable(
  'orders',
  {
    id: uuid('id').primaryKey().defaultRandom().notNull(),
    tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
    customerName: text('customer_name').notNull(),
    customerAddress: text('customer_address').notNull(),
    items: jsonb('items').$type<CartItem[]>().notNull(),
    subtotalAmount: integer('subtotal_amount').notNull(),
    discountAmount: integer('discount_amount').notNull().default(0),
    taxAmount: integer('tax_amount').notNull().default(0),
    totalAmount: integer('total_amount').notNull(),
    status: text('status').default('pending').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => [
    ...createMultiTenantPolicies('orders'),
  ]
).enableRLS();

// ==============================================================================
// 4. THE USERS TABLE (Uses Multi-Tenant Policy Helper + Composite Unique Index)
// ==============================================================================
export const users = pgTable(
  'users',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id')
      .references(() => tenants.id, { onDelete: 'cascade' })
      .notNull(),
    email: text('email').notNull(),
    passwordHash: text('password_hash').notNull(),
    name: text('name').notNull(),
    role: text('role', { enum: ['owner', 'manager', 'staff'] })
      .default('owner')
      .notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('tenant_email_idx').on(table.tenantId, table.email),
    ...createMultiTenantPolicies('users'),
  ]
).enableRLS();

// Add to src/core/db/schema.ts:

// ==============================================================================
// 5. COUPONS TABLE (Promotions & Discounts)
// ==============================================================================
export const coupons = pgTable(
  'coupons',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id')
      .references(() => tenants.id, { onDelete: 'cascade' })
      .notNull(),
    code: text('code').notNull(), // e.g. "FLAT50" or "WELCOME20"
    discountType: text('discount_type', { enum: ['flat', 'percentage'] }).notNull(),
    discountValue: integer('discount_value').notNull(), // flat amount in paise (e.g. 5000 = ₹50) or percentage (e.g. 20 = 20%)
    minOrderAmount: integer('min_order_amount').default(0).notNull(), // minimum subtotal in paise to qualify
    maxDiscountAmount: integer('max_discount_amount'), // cap for percentage discounts in paise (e.g. 10000 = ₹100 max)
    isActive: boolean('is_active').default(true).notNull(),
    expiresAt: timestamp('expires_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    // Unique coupon code per restaurant
    uniqueIndex('tenant_coupon_code_idx').on(table.tenantId, table.code),
    // Inherit full multi-tenant RLS policies
    ...createMultiTenantPolicies('coupons'),
  ]
).enableRLS();

export type Coupon = typeof coupons.$inferSelect;
export type NewCoupon = typeof coupons.$inferInsert;