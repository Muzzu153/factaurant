import { Tenant, TenantSchema } from '../../src/core/db/zod-schema/tenant.schema'

export function createValidTenant(overrides?: Partial<Tenant>): Tenant {
    const defaults: Tenant = { 
        id: 1,
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
                    ctaText: "",

                    // subhdeading: "Experience the taste of Japan",
                }
            },
            "menu_1": {
                type: "menu_list",
                props: { rows: 3 }
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

        },

    }

    const merged = {
        ...defaults,
        ...overrides,

        blocks: {
            ...defaults.blocks,
            ...overrides?.blocks,
        },

        pages: {
            ...defaults.pages,
            ...overrides?.pages,
        },
    }

    // return TenantSchema.parse(merged)
    return merged
}

