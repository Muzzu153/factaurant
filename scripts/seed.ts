import 'dotenv/config'
import { db } from '@/core/db/client';
import { tenants, products, orders } from "../src/core/db/schema";

async function main() {
    console.log('Starting seed....');

    await db.delete(products);
    await db.delete(orders);
    await db.delete(tenants);

    // 4. CREATE TENANT B: "Sushi Master (The Luxury Brand)"
    const [sushiTenant] = await db.insert(tenants).values({
        name: 'Sushi Master',
        slug: 'sushi-master',
        theme: {
            colors: {
                primary: '#000985ff',
                secondary: '#8ec8ffff',
                tertiary: '#ff78f8ff',
                accent: '#55ffccff',
                background: '#ff7c85ff',
                text: '#ffffffff',
            },

            borderRadius: {
                xsm: '1em',
                sm: '3em',
                md: '5em',
                lg: '8em',
                xl: '10em',
                xlg: '12em',
            },

            fonts: {
                heading: 'sans',
                body: 'serif',
            },
        },

        blocks: {
            "hero_1": {
                type: "hero_video",
                props: {
                    videoUrl: "https://videos.pexels.com/video-files/3195655/3195655-uhd_2560_1440_25fps.mp4",

                    heading: "Artisan Sushi",
                    subheading: "Experience the taste of Japan"
                }
            },
            "menu_1": {
                type: "menu_grid",
                props: { columns: 3 }
            },
            "nav_1": { type: "navbar_simple", props: {} }, // We'll build these placeholders later
            "footer_1": { type: "footer_simple", props: { text: "© 2025 Pizza King" } }
        },
        // THE BLUEPRINT
        pages: {
            "home": {
                layout: {
                    header: ["nav_1", "hero_1"], // Nav then Hero
                    main: ["menu_1"],            // Menu in middle
                    footer: ["footer_1"]
                },
                meta: { title: "Pizza King - Home" }
            }

        }
    }).returning();

    // 3. Create TENANT A: "PIZZA KING" (The Fun Brand)
    // We use .returning() to get the ID back so we can link products to it.
    const [pizzaTenant] = await db.insert(tenants).values({
        slug: 'pizza-king', // We will acess this via pizza-king.localhost:3000
        name: 'Pizza King',
        theme: {
            colors: {
                primary: '#e11d48',
                secondary: '#ebafb3ff',
                tertiary: '#8a0083ff',
                accent: '#750910ff',
                background: '#fff1f2',
                text: '#ffffffff',
            },

            borderRadius: {
                xsm: '0.5em',
                sm: '1em',
                md: '3em',
                lg: '5em',
                xl: '8em',
                xlg: '10em',
            },

            fonts: {
                heading: 'sans',
                body: 'serif',
            }

            // color
            // primaryColor: '#e11d48', // Rosw Red
            // background: '#fff1f2',   // Light Pinkish White
            // radius: '1em',
            // fontHeading: 'sans',
            // fontBody: 'sans',
        },
        blocks: {
            "hero_main": {
                type: "hero_text", // Different component type
                props: {
                    heading: "Hot & Fresh",
                    ctaText: "Order Now",
                }
            },
            "menu_main": {
                type: "menu_list", // Different component type
                props: {}
            },
            "nav_main": { type: "navbar_simple", props: {} },
            "footer_main": { type: "footer_simple", props: { text: "© 2025 Sushi Master" } }
        },
        pages: {
            "home": {
                layout: {
                    header: ["nav_main", "hero_main"],
                    main: ["menu_main"],
                    footer: ["footer_main"]
                },
                meta: { title: "Sushi Master - Home" }
            }
        }

    }).returning();
    const [burgerTenant] = await db.insert(tenants).values({
        slug: 'queens-burger', // We will acess this via pizza-king.localhost:3000
        name: 'Queen\'s Burger',
        theme: {
            colors: {
                primary: '#75ff69',
                secondary: 'rgb(185, 42, 51)',
                tertiary: 'rgb(0, 255, 221)',
                accent: 'rgb(122, 131, 0)',
                background: '#fff1f2',
                text: '#ffffffff',
            },

            borderRadius: {
                xsm: '0.5em',
                sm: '1em',
                md: '3em',
                lg: '5em',
                xl: '8em',
                xlg: '10em',
            },

            fonts: {
                heading: 'sans',
                body: 'serif',
            }

        },
        blocks: {
            "hero_main": {
                type: "hero_text", // Different component type
                props: {
                    heading: "Hot & Fresh",
                    ctaText: "Order Now",
                }
            },
            "menu_main": {
                type: "menu_list", // Different component type
                props: {}
            },
            "nav_main": { type: "navbar_simple", props: {} },
            "footer_main": { type: "footer_simple", props: { text: "© 2025 Sushi Master" } }
        },
        pages: {
            "home": {
                layout: {
                    header: ["nav_main", "hero_main"],
                    main: ["menu_main"],
                    footer: ["footer_main"]
                },
                meta: { title: "Queen's Burger- Home" }
            }
        }

    }).returning();



    await db.insert(products).values([
        {
            tenantId: pizzaTenant.id,
            name: 'Pepperoni Blast',
            description: 'Double cheese, double pepperoni, crispy crust.',
            price: 1899, // 18.99 (Stored in cents)
            imageUrl: 'https://unsplash.com/photos/a-pizza-with-several-slices-cut-out-of-it-amYCy53AOSU',
        },
        {
            tenantId: pizzaTenant.id,
            name: 'Veggie Supreme',
            description: 'Mushrooms, onions, peppers, and olives.',
            price: 1599,
            imageUrl: 'https://unsplash.com/photos/freshly-baked-delicious-pizza-on-wooden-table-original-italian-food-background-pizza-concept-gi2aexB9X3Y,'
        },
    ]);

    await db.insert(products).values([
        {
            tenantId: sushiTenant.id,
            name: 'Dragon Roll',
            description: 'Eel, cucumber, topped with avocado.',
            price: 2200,
            imageUrl: '',
        },
        {
            tenantId: sushiTenant.id,
            name: 'Salmon Nigiri',
            description: 'Fresh Atlantic salon on rice',
            price: 800,
            imageUrl: '',
        },
    ]);

    await db.insert(products).values([
        {
            tenantId: burgerTenant.id,
            name: 'Double patty',
            description: 'Potato, spinach, tomato sauce',
            price: 1200,
            imageUrl: '',
        },
        {
            tenantId: burgerTenant.id,
            name: 'Jumbo Special',
            description: 'Double cheese slice, double chicken patty, double sauces',
            price: 2800,
            imageUrl: '',
        },
    ]);

    console.log('Seeding Complete');
    process.exit(0);
}

main().catch((err) => {
    console.error('Seeding Failed:', err);
    process.exit(1);
})