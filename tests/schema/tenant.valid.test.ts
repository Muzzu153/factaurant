import { test, expect } from 'vitest'
import { createValidTenant } from 'tests/fixtures/validTenant'
import { TenantSchema } from '../../src/core/db/zod-schema/tenant.schema'

test('valid tenant passes', () => {
    const tnant = createValidTenant()
    expect(() => TenantSchema.parse(tnant)).not.toThrow()
})

test('tenant cannot reference missing blocks', () => {
    const tenant = createValidTenant({
        pages: {
            home: {
                layout: {
                    header: ["nav_1","hero_1","nav_2"],
                    main: ["menu_1"],
                    footer: ["footer_1"],
                },
            },
        },
    })

    expect(() => {
        TenantSchema.parse(tenant)
    }).toThrow()

})

test('Tenants without id fails', () => {
    const tenant = createValidTenant()
    delete tenant.id

    expect(()=>{
        TenantSchema.parse(tenant)
    }).toThrow()
})

test('Incorrect slug type', () => {
    const tenant = createValidTenant({
        slug: "Muzaffer_slug_type"
    })

    expect(() => {
        TenantSchema.parse(tenant)
    }).toThrow()
})

test('Correct slug type', () => {
    const tenant = createValidTenant({
        slug: "susheee-master"
    })

    expect(() => {
        TenantSchema.parse(tenant)
    }).not.toThrow()
})

test('Incorrect Block type', () => {
    const tenant = createValidTenant({
        blocks: {
            "hero_1": {
                type: "hero.video",
            }
        }
    })

    expect(() => {
        TenantSchema.parse(tenant)
    }).toThrow()
})

test('Correct Block type', () => {
    const tenant = createValidTenant({
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
        }
    })

    expect(() => {
        TenantSchema.parse(tenant)
    }).not.toThrow()
})


test('Incorrect block reference in page layout', () => {
    const tenant = createValidTenant({
        pages: {
            contact_us: {
                layout: {
                    header: ["nav_1", "hero_1"],
                    main: ["menu_1"],
                    footer: ["footer_3"]
                }
            }
        }
    })

    expect(() => {
        TenantSchema.parse(tenant)
    }).toThrow()
})

test('Tenant wihtout pages fail', () => {
    const tenant = createValidTenant({})
    delete tenant.pages

    expect(() => {
        TenantSchema.parse(tenant)
    }).toThrow()
})

test('blocks should reference required props', () => {
    const tenant = createValidTenant({
        blocks: {
            "hero_1": {
                type: "hero_video",
                props: {
                    // videoUrl: "https://videos.pexels.com/video-files/3195655/3195655-uhd_2560_1440_25fps.mp4",
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
        }
    })

    expect(() => {
        TenantSchema.parse(tenant)
    }).toThrow()
})

test('hero video rejects invalid video-url', () => {
    const tenant = createValidTenant({
        blocks: {
            "hero_1": {
                type: "hero_video",
                props: {
                    // videoUrl: "https://videos.pexels.com/video-files/3195655/3195655-uhd_2560_1440_25fps.mp4",
                    videoUrl: "should be a valid url",
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
        }
    })

    expect(() => {
        TenantSchema.parse(tenant)
    }).toThrow()
})

test('blocks should fail to reference unknown props', () => {
    const tenant = createValidTenant({
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
                props: { rows: 3, random_prop: "none" }
            },
            "nav_1": { type: "navbar_simple", props: {} }, 
            "footer_1": { type: "footer_simple", props: { text: "© 2025 Pizza King" } }
        }
    })

    expect(() => {
        TenantSchema.parse(tenant)
    }).toThrow()
})

test('Cannot delete block that referenced in pages', ()=>{
    const tenant  = createValidTenant()

    delete tenant.blocks['hero_1']

    expect(()=>{
        TenantSchema.parse(tenant)
    }).toThrow()
})