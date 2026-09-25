import 'dotenv/config'
import { db } from '@/core/db/client';
import { tenants, products } from '../src/core/db/schema'

async function seed() {
  console.log('🌱 Seeding test database...')

  const [pizzaKing] = await db
    .insert(tenants)
    .values({
      slug: 'pizza-king',
      name: 'Pizza King',
      theme: {
        colors: {
          primary: '#FF0000',
          secondary: '#FFD700',
          tertiary: '#FFA500',
          accent: '#8B0000',
          text: '#000000',
          background: '#FFFFFF',
        },
        borderRadius: { xsm: '2px', sm: '4px', md: '8px', lg: '16px', xl: '24px' },
        fonts: { heading: 'sans-serif', body: 'sans-serif' },
      },
      blocks: {
        nav_main: { type: 'navbar_simple', props: {} },
        hero_main: {
          type: 'hero_text',
          props: { heading: 'Best Pizza in Town', ctaText: 'Order Now' },
        },
        menu_main: { type: 'menu_grid', props: { columns: 3 } },
        footer_main: { type: 'footer_simple', props: { text: '© Test Pizza King' } },
      },
      pages: {
        home: {
          layout: {
            header: ['nav_main', 'hero_main'],
            main: ['menu_main'],
            footer: ['footer_main'],
          },
        },
      },
    })
    .returning()

  const [sushiMaster] = await db
    .insert(tenants)
    .values({
      slug: 'sushi-master',
      name: 'Sushi Master',
      theme: {
        colors: {
          primary: '#000000',
          secondary: '#FFFFFF',
          tertiary: '#E0E0E0',
          accent: '#E91E63',
          text: '#212121',
          background: '#F5F5F5',
        },
        borderRadius: { xsm: '1px', sm: '2px', md: '4px', lg: '8px', xl: '12px' },
        fonts: { heading: 'serif', body: 'sans-serif' },
      },
      blocks: {
        nav_main: { type: 'navbar_simple', props: {} },
        hero_main: {
          type: 'hero_text',
          props: { heading: 'Authentic Japanese Sushi', ctaText: 'View Menu' },
        },
        menu_main: { type: 'menu_list', props: {} },
        footer_main: { type: 'footer_simple', props: { text: '© Test Sushi Master' } },
      },
      pages: {
        home: {
          layout: {
            header: ['nav_main', 'hero_main'],
            main: ['menu_main'],
            footer: ['footer_main'],
          },
        },
      },
    })
    .returning()

  await db.insert(products).values([
    {
      tenantId: pizzaKing.id,
      name: 'Margherita Pizza',
      description: 'Classic tomato and mozzarella',
      price: 1299, // cents
      imageUrl: null,
      isAvailable: true,
    },
    {
      tenantId: pizzaKing.id,
      name: 'Pepperoni Pizza',
      description: 'Loaded with pepperoni',
      price: 1499,
      imageUrl: null,
      isAvailable: true,
    },
    {
      tenantId: sushiMaster.id,
      name: 'California Roll',
      description: 'Crab, avocado, cucumber',
      price: 899,
      imageUrl: null,
      isAvailable: true,
    },
    {
      tenantId: sushiMaster.id,
      name: 'Salmon Nigiri',
      description: 'Fresh salmon over rice',
      price: 699,
      imageUrl: null,
      isAvailable: true,
    },
  ])

  console.log(`✅ Seeded 2 tenants (${pizzaKing.slug}, ${sushiMaster.slug}) and 4 products`)
  process.exit(0)
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})