import { createFileRoute, useLoaderData } from '@tanstack/react-router'
import { BlockRenderer } from '@/core/ui/BlockRenderer'
import { CartFloatingButton } from '@/modules/cart/ui/CartFloatingButton'
import { CartDrawer } from '@/modules/cart/ui/CartDrawer'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  const { tenant } = useLoaderData({ from: '__root__' }) as any

  return (
    <div className="min-h-screen flex flex-col">
      {/* 1. RENDER HEADER AREA */}
      <BlockRenderer tenant={tenant} pageSlug="home" areaSlug="header" />

      {/* 2. RENDER MAIN AREA */}
      <main className="flex-1 container mx-auto px-4">
        <BlockRenderer tenant={tenant} pageSlug="home" areaSlug="main" />
      </main>

      {/* 3. RENDER FOOTER AREA */}
      <BlockRenderer tenant={tenant} pageSlug="home" areaSlug="footer" />

      {/* 4. GLOBAL ELEMENTS (Cart) */}
      <CartFloatingButton />
      <CartDrawer />
    </div>
  )
}
