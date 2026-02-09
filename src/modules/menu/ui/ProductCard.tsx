import { cartService } from '../../cart/cart.store'
import { Product } from '../../../core/db/zod-schema/product.schema'

const formatPrice = (cents: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100)
}

export function ProductCard({ product }: { product: Product }) {
  return (
    <div className="group bg-background relative flex flex-col overflow-hidden border border-slate-200 bg-white shadow-sm transition hover:shadow-md rounded-theme">
      {/* IMAGE SECTION */}
      <div className="aspect-[4/3] w-full overflow-hidden bg-slate-100">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-400">
            No Image
          </div>
        )}
      </div>

      {/* DETAILS SECTION */}
      <div className="flex flex-1 flex-col p-4">
        {/* Uses the dynamic font variable from the DB */}
        <h3 className="mb-1 text-lg font-bold font-heading text-slate-900">
          {product.name}
        </h3>

        <p className="mb-4 text-sm text-slate-500 line-clamp-2">
          {product.description}
        </p>

        {/* FOOTER: PRICE & ADD BUTTON */}
        <div className="mt-auto flex items-center justify-between">
          <span className="text-lg font-semibold text-slate-900">
            {formatPrice(product.price)}
          </span>

          <button
            data-testid={`add-to-cart-${product.id}`}
            onClick={() => cartService.add(product)}
            className="px-4 py-2 bg-blue-600 text-sm font-medium text-black transition hover:opacity-90 rounded-theme cursor-pointer"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  )
}
