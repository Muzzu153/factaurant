import { COMPONENT_REGISTRY } from '../..//modules/hero/registry'
import { FeatureBoundary } from './FeatureBoundary'
// import { env } from '../runtime/env.server'
import { clientEnv } from '../runtime/env.client'

interface BlockRendererProps {
  tenant: {
    blocks: Record<string, { type: string; props: any }>
    pages: Record<string, { layout: Record<string, string[]> }>
  }
  pageSlug: string
  areaSlug: string
}

export function BlockRenderer({tenant, pageSlug, areaSlug }: BlockRendererProps) {

  // 1. Safety Check
  if (!tenant.pages || !tenant.pages[pageSlug]) return null

  // 2. Get Layout
  const blockIds: string[] = tenant.pages[pageSlug].layout[areaSlug] || []

  return (
    <div data-cms-area={areaSlug} className="flex flex-col">
      {blockIds.map((blockId) => {
        const block = tenant.blocks[blockId]
        if (!block) return null

        const Component = COMPONENT_REGISTRY[block.type]

        if (!Component) {
          if (clientEnv.NODE_ENV === 'development') {
            console.log('Component not available')
            return (
              <div className="p-2 bg-red-100 text-xs">
                Unknown: {block.type}
              </div>
            )
          }
        }

        return (
          <FeatureBoundary key={blockId} name={block.type}>
            {/* <Suspense fallback={<div className="h-24 bg-slate-50 animate-pulse" />}> */}
            <Component {...block.props} />
            {/* </Suspense> */}
          </FeatureBoundary>
        )
      })}
    </div>
  )
}
