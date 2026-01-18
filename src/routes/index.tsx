import { createFileRoute } from '@tanstack/react-router';
import { BlockRenderer } from '@/core/ui/BlockRenderer';
import { CartFloatingButton } from '@/modules/cart/ui/cartFloatingButton';
import { CartDrawer } from '@/modules/cart/ui/cartDrawer';

export const Route = createFileRoute('/')({
  component: Home,
});

function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* 1. RENDER HEADER AREA */}
      <BlockRenderer pageSlug="home" areaSlug="header" />

      {/* 2. RENDER MAIN AREA */}
      <main className="flex-1 container mx-auto px-4">
        <BlockRenderer pageSlug="home" areaSlug="main" />
      </main>

      {/* 3. RENDER FOOTER AREA */}
      <BlockRenderer pageSlug="home" areaSlug="footer" />

      {/* 4. GLOBAL ELEMENTS (Cart) */}
      <CartFloatingButton />
      <CartDrawer />
    </div>
  );
}