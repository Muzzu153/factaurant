import { createFileRoute } from '@tanstack/react-router'
import { getTenant } from '@/modules/tenant/function'
import { getProducts } from '@/modules/menu/functions'
import { ProductCard } from '@/modules/menu/components/ProductCard'

export const Route = createFileRoute('/')({

  // 1. THE LOADER
  // Runs on the server before the page loads
  loader: async()=>{
    // A. Identify who the store is
    const tenant = await getTenant();

    // B. Fetch thier specific menu
    // We pass the tenant.id we just found
    const products = await getProducts({ data: {tenantId: tenant.id}})

    // C. Return both the component
    return {tenant, products}
  },

  component: Home,
})

function Home() {
 // 2. GET DATA
  // The types are automatically inferred! TypeScript knows 'products' is an array.
  const { tenant, products } = Route.useLoaderData();

  return (
    <div className="container mx-auto max-w-5xl p-6">
      {/* HEADER */}
      <header className="mb-12 text-center">
        <h1 className="mb-2 text-4xl font-extrabold font-heading tracking-tight text-slate-900">
          {tenant.name}
        </h1>
        <p className="text-slate-600">Order fresh styling, delivered fast.</p>
      </header>

      {/* MENU GRID */}
      {products.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center text-slate-500">
          <p>The kitchen is closed (No products found).</p>
        </div>
      )}
    </div>
  );
}