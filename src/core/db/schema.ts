import { CartItem } from '@/modules/orders/order.schema';
import {
  pgTable,
  text,
  uuid,
  jsonb,
  timestamp,
  integer,
  boolean,
  uniqueIndex,
  pgPolicy,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

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

// ==============================================================================
// 🛡️ REUSABLE MULTI-TENANT POLICY FACTORY (For all tables with `tenant_id`)
// ==============================================================================
export function createMultiTenantPolicies(tableName: string) {
  return [
    // 1. Admin Policy (postgres superuser has full access for seeds & migrations)
    pgPolicy(`postgres_admin_${tableName}_all`, {
      for: 'all',
      to: 'postgres',
      using: sql`true`,
      withCheck: sql`true`,
    }),

    // 2. App Runtime Policy (100% Engine-Enforced Tenant Isolation via tenant_id)
    pgPolicy(`factaurant_app_${tableName}_isolation`, {
      for: 'all',
      to: 'factaurant_app',
      using: sql`tenant_id = nullif(current_setting('app.current_tenant_id', true), '')::uuid`,
      withCheck: sql`tenant_id = nullif(current_setting('app.current_tenant_id', true), '')::uuid`,
    }),

    // 3. Smoke Reader Policy (Read access for automated test runner)
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
// 2. THE PRODUCT TABLE (Uses Multi-Tenant Policy Helper)
// ==============================================================================
export const products = pgTable(
  'products',
  {
    id: uuid('id').primaryKey().defaultRandom().notNull(),
    tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
    name: text('name').notNull(),
    description: text('description'),
    price: integer('price').notNull(),
    imageUrl: text('image_url'),
    isAvailable: boolean('is_available').default(true).notNull(),
  },
  (table) => [
    ...createMultiTenantPolicies('products'),
  ]
).enableRLS();

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
