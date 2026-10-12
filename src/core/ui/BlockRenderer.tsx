import { Suspense } from 'react';
import { useLoaderData } from '@tanstack/react-router';
import { COMPONENT_REGISTRY } from '../../registry';
import { FeatureBoundary } from './FeatureBoundary';

interface BlockRendererProps {
  tenant?: any
  pageSlug: string
  areaSlug: string
}

export function BlockRenderer({ pageSlug, areaSlug, tenant: propTenant }: BlockRendererProps) {
  let tenant = propTenant;

   if (!tenant) {
    try {
      const data = useLoaderData({ strict: false }) as any;
      tenant = data?.tenant;
    } catch {
      tenant = null;
    }
  }

  if (!tenant?.pages || !tenant?.pages[pageSlug]) return null;

  const blockIds: string[] = tenant.pages[pageSlug].layout?.[areaSlug] || [];

  return (
    <div data-cms-area={areaSlug} className="flex flex-col">
      {blockIds.map((blockId) => {
        const block = tenant.blocks?.[blockId];
        if (!block) return null;

        // 1. LOOKUP COMPONENT
        const Component = COMPONENT_REGISTRY[block.type as keyof typeof COMPONENT_REGISTRY];

        // ⚡ 2. GUARD: If Component is undefined, return null immediately!
        // Never attempt to render <Component /> if it doesn't exist.
        if (!Component) {
          if (process.env.NODE_ENV === 'development') {
            console.log('Component not available')
            return (
              <div key={blockId} className="p-2 bg-red-50 text-red-600 text-xs border border-red-200 rounded my-1">
                Unknown block type: {block.type}
              </div>
            );
          }
          return null;
        }

        return (
          <FeatureBoundary key={blockId} name={block.type}>
            <Suspense fallback={<div className="h-24 bg-slate-100 animate-pulse rounded-md my-2" />}>
              <Component {...block.props} />
            </Suspense>
          </FeatureBoundary>
        );
      })}
    </div>
  );
}