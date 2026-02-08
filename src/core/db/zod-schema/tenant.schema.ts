import { z } from 'zod'
import { ThemeSchema } from './theme.schema'
import { BlockSchema } from './strict-block'
import { PageLayoutSchema } from './page.schema'

export const TenantSchema = z.object({
    id: z.number(),
    slug: z.string().max(50).regex(/^[a-z0-9-]+$/),
    name: z.string().min(1).max(100),
    theme: ThemeSchema,
    blocks: z.record(z.string(), BlockSchema),
    pages: z.record(z.string(), PageLayoutSchema),
})
    .superRefine((tenant, ctx) => {
        // ✅ More efficient: create Set once
        const blockIds = new Set(Object.keys(tenant.blocks))

        // ✅ Collect all referenced block IDs first
        const referencedBlockIds = new Set<string>()

        for (const [pageName, page] of Object.entries(tenant.pages)) {
            for (const [area, blockList] of Object.entries(page.layout)) {
                if (!Array.isArray(blockList)) continue

                for (const blockId of blockList) {
                    referencedBlockIds.add(blockId)

                    // Check if block exists
                    if (!blockIds.has(blockId)) {
                        ctx.issues.push({
                            path: ['pages', pageName, 'layout', area],
                            message: `Block "${blockId}" referenced in ${pageName}.${area} does not exist in tenant.blocks`,
                            code: 'custom',
                            input: tenant,
                        })
                    }
                }
            }

            const unusedBlocks = [...blockIds].filter(id => !referencedBlockIds.has(id))
            if (unusedBlocks.length > 0) {
                console.warn(`Unused blocks in tenant "${tenant.slug}":`, unusedBlocks)
            }
        }
    })

export type Tenant = z.infer<typeof TenantSchema> 
