import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import fs from 'node:fs';
import path from 'node:path';
import * as schema from '../src/core/db/schema';
import { tenants, products, orders, users, coupons, categories } from '../src/core/db/schema';
import bcrypt from 'bcryptjs';

// process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const connectionString = process.env.MIGRATION_DATABASE_URL || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('❌ MIGRATION_DATABASE_URL is missing in .env!');
}

const cleanConnectionString = connectionString.replace(/[\?&]sslmode=[^&]+/, '');

// Load CA certificate if present
const certPath = path.resolve(process.cwd(), 'certs/prod-ca-2021.crt');
const caCert = fs.existsSync(certPath) ? fs.readFileSync(certPath, 'utf8') : undefined;

const pool = new pg.Pool({
  connectionString: cleanConnectionString,
  ssl: {
    ca: caCert,
    rejectUnauthorized: true,
  },
});

const adminDb = drizzle(pool, { schema });

async function seed() {
  console.log('🌱 Seeding test database with verified SSL connection...');
  try {
    // 1. Wipe in reverse foreign-key order
    await adminDb.delete(coupons); // Clean coupons first
    await adminDb.delete(orders);
    await adminDb.delete(products);
    await adminDb.delete(users);
    await adminDb.delete(categories);
    await adminDb.delete(tenants);
    console.log('🧹 Cleaned existing records.');

    // 2. Insert Pizza King
    const [pizzaTenant] = await adminDb
      .insert(tenants)
      .values({
        name: 'Pizza King',
        slug: 'pizza-king',
        theme: {
          colors: {
            primary: '#e11d48',
            secondary: '#ffd700',
            tertiary: '#ffa500',
            accent: '#8b0000',
            text: '#000000',
            background: '#fff1f2',
          },
          borderRadius: {
            xsm: '2px',
            sm: '4px',
            md: '8px',
            lg: '16px',
            xl: '24px',
          },
          fonts: {
            heading: 'sans-serif',
            body: 'sans-serif',
          },
        },
        blocks: {
          hero_1: {
            type: 'hero_video',
            props: {
              videoUrl: 'https://videos.pexels.com/video-files/3195655/3195655-uhd_2560_1440_25fps.mp4',
              heading: 'Hot & Fresh',
              ctaText: 'Order Now',
            },
          },
          menu_1: {
            type: 'menu_grid',
            props: { columns: 3 },
          },
          nav_1: { type: 'navbar_simple', props: {} },
          footer_1: { type: 'footer_simple', props: { text: '© 2026 Pizza King' } },
        },
        pages: {
          home: {
            layout: {
              header: ['nav_1', 'hero_1'],
              main: ['menu_1'],
              footer: ['footer_1'],
            },
            meta: { title: 'Pizza King - Home', description: 'Best pizza in town' },
          },
        },
      })
      .returning();

    // 3. Insert Sushi Master
    const [sushiTenant] = await adminDb
      .insert(tenants)
      .values({
        name: 'Sushi Master',
        slug: 'sushi-master',
        theme: {
          colors: {
            primary: '#0f172a',
            secondary: '#38bdf8',
            tertiary: '#0284c7',
            accent: '#0369a1',
            text: '#0f172a',
            background: '#f8fafc',
          },
          borderRadius: {
            xsm: '0px',
            sm: '0px',
            md: '0px',
            lg: '0px',
            xl: '0px',
          },
          fonts: {
            heading: 'serif',
            body: 'sans-serif',
          },
        },
        blocks: {
          hero_main: {
            type: 'hero_text',
            props: {
              heading: 'Artisan Sushi',
              subheading: 'Experience the taste of Japan',
            },
          },
          menu_main: {
            type: 'menu_list',
            props: {},
          },
          nav_main: { type: 'navbar_simple', props: {} },
          footer_main: { type: 'footer_simple', props: { text: '© 2026 Sushi Master' } },
        },
        pages: {
          home: {
            layout: {
              header: ['nav_main', 'hero_main'],
              main: ['menu_main'],
              footer: ['footer_main'],
            },
            meta: { title: 'Sushi Master - Home', description: 'Fresh artisan sushi' },
          },
        },
      })
      .returning();

    // 4. Insert Default Admin Users
    const defaultPasswordHash = await bcrypt.hash('Password123!', 10);
    await adminDb.insert(users).values([
      {
        tenantId: pizzaTenant.id,
        name: 'Mario Rossi',
        email: 'admin@pizzaking.com',
        passwordHash: defaultPasswordHash,
        role: 'owner',
      },
      {
        tenantId: sushiTenant.id,
        name: 'Kenji Sato',
        email: 'admin@sushimaster.com',
        passwordHash: defaultPasswordHash,
        role: 'owner',
      },
    ]);
    console.log('👤 Created default store owners.');

    // 5. Insert Products
    // In scripts/seed.ts - inside products insert array:
    await adminDb.insert(products).values([
      {
        tenantId: pizzaTenant.id,
        name: 'Pepperoni Blast',
        description: 'Double cheese, spicy pepperoni, herb-infused tomato sauce.',
        price: 29900, // Base price: ₹299.00
        imageUrl: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=1000',
        dietaryType: 'non_veg',
        isAvailable: true,
        // Modifier configuration
        modifierGroups: [
          {
            id: 'size_group',
            name: 'Select Size',
            minSelection: 1, // Mandatory
            maxSelection: 1, // Single choice (Radio)
            options: [
              { id: 'size_reg', name: 'Regular (8")', price: 0, isDefault: true },
              { id: 'size_med', name: 'Medium (10")', price: 15000 }, // +₹150.00
              { id: 'size_lge', name: 'Large (12")', price: 28000 },  // +₹280.00
            ],
          },
          {
            id: 'crust_group',
            name: 'Crust Choice',
            minSelection: 1,
            maxSelection: 1,
            options: [
              { id: 'crust_pan', name: 'Classic Pan Crust', price: 0, isDefault: true },
              { id: 'crust_thin', name: 'Crispy Thin Crust', price: 3000 }, // +₹30.00
              { id: 'crust_burst', name: 'Cheese Burst Crust', price: 9900 }, // +₹99.00
            ],
          },
          {
            id: 'addons_group',
            name: 'Extra Toppings',
            minSelection: 0, // Optional
            maxSelection: 4, // Multi-select (Checkbox)
            options: [
              { id: 'addon_cheese', name: 'Extra Mozzarella', price: 5000 }, // +₹50.00
              { id: 'addon_jalapeno', name: 'Pickled Jalapenos', price: 3500 }, // +₹35.00
              { id: 'addon_mushrooms', name: 'Fresh Mushrooms', price: 4000 }, // +₹40.00
            ],
          },
        ],
      },
      {
        tenantId: pizzaTenant.id,
        name: 'Veggie Supreme',
        description: 'Loaded with bell peppers, red onions, mushrooms, and golden corn.',
        price: 24900, // ₹249.00
        imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=1000',
        dietaryType: 'veg',
        isAvailable: true,
        modifierGroups: [
          {
            id: 'size_group',
            name: 'Select Size',
            minSelection: 1,
            maxSelection: 1,
            options: [
              { id: 'size_reg', name: 'Regular (8")', price: 0, isDefault: true },
              { id: 'size_med', name: 'Medium (10")', price: 13000 },
              { id: 'size_lge', name: 'Large (12")', price: 24000 },
            ],
          },
        ],
      },
      {
        tenantId: sushiTenant.id,
        name: 'Dragon Roll',
        description: 'Eel and cucumber topped with sliced avocado and sweet unagi glaze.',
        price: 45000,
        imageUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=1000',
        dietaryType: 'non_veg',
        isAvailable: true,
        modifierGroups: [], // No modifiers
      },
      {
        tenantId: sushiTenant.id,
        name: 'Salmon Nigiri',
        description: 'Fresh Atlantic salmon over hand-pressed seasoned sushi rice.',
        price: 32000,
        imageUrl: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd43ea?q=80&w=1000',
        dietaryType: 'non_veg',
        isAvailable: true,
        modifierGroups: [], // No modifiers
      },
    ]);

    // 6. Insert Coupons (after inserting pizzaTenant and sushiTenant):
    await adminDb.insert(coupons).values([
      {
        tenantId: pizzaTenant.id,
        code: 'PIZZA50',
        discountType: 'flat',
        discountValue: 5000, // Flat ₹50.00 in paise
        minOrderAmount: 30000, // Minimum order ₹300.00
        isActive: true,
      },
      {
        tenantId: pizzaTenant.id,
        code: 'FEAST20',
        discountType: 'percentage',
        discountValue: 20, // 20%
        minOrderAmount: 40000, // Minimum order ₹400.00
        maxDiscountAmount: 10000, // Max discount capped at ₹100.00
        isActive: true,
      },
      {
        tenantId: sushiTenant.id,
        code: 'SUSHI10',
        discountType: 'percentage',
        discountValue: 10, // 10%
        minOrderAmount: 50000, // Minimum order ₹500.00
        maxDiscountAmount: 15000, // Max discount capped at ₹150.00
        isActive: true,
      },
    ]);
    console.log('Created sample coupons for Pizza King and Sushi Master.');
    console.log('🍕 Created products for Pizza King & Sushi Master.');

    console.log('✅ Seed completed successfully with strict SSL verification!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seed();