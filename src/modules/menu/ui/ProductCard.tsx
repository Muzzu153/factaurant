import { cartService } from '../../cart/cart.store'
import { DietaryBadge } from './DietaryBadge'
import type { products } from '../../../core/db/schema'
import { img } from '../../../core/utils/image'

const formatPrice = (cents: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(cents / 100)
}

type Product = typeof products.$inferSelect;

export function ProductCard({ product }: { product: Product }) {
  const isAvailable = product.isAvailable;


  return (
    <div
      className={`group relative flex flex-col overflow-hidden border border-slate-200 bg-white shadow-sm transition duration-200 rounded-theme ${
        isAvailable ? 'hover:shadow-md' : 'opacity-70 bg-slate-50'
      }`}
    >
      {/* 1. PRODUCT IMAGE WITH OVERLAY */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
        {product.imageUrl ? (
          <img
            src={img.card(product.imageUrl)}
            alt={product.name}
            className={`h-full w-full object-cover transition duration-300 ${
              isAvailable ? 'group-hover:scale-105' : 'grayscale-[50%]'
            }`}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-400 text-sm">
            No Image
          </div>
        )}

        {/* ⚡ SOLD OUT BANNER OVERLAY */}
        {!isAvailable && (
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px] flex items-center justify-center">
            <span className="px-3 py-1 bg-red-600 text-white text-xs font-bold uppercase tracking-wider rounded-full shadow">
              Sold Out
            </span>
          </div>
        )}
      </div>

      {/* 2. PRODUCT DETAILS */}
      <div className="flex flex-1 flex-col p-4">
        {/* Header: Name + Dietary Badge */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="text-base font-bold font-heading text-slate-900 line-clamp-1">
            {product.name}
          </h3>
          <DietaryBadge dietaryType={product.dietaryType as any} />
        </div>

        <p className="mb-4 text-xs text-slate-500 line-clamp-2">
          {product.description || 'Deliciously prepared fresh with premium ingredients.'}
        </p>

        {/* Action Footer */}
        <div className="mt-auto flex items-center justify-between pt-2 border-t border-slate-100">
          <span className="text-base font-bold text-slate-900">
            {formatPrice(product.price)}
          </span>

          <button
            onClick={() => isAvailable && cartService.add(product)}
            disabled={!isAvailable}
            className={`px-4 py-1.5 text-xs font-semibold rounded-theme transition cursor-pointer ${
              isAvailable
                ? 'bg-blue-500 text-[#ffffff] hover:opacity-90 active:scale-95'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            {isAvailable ? 'Add' : 'Sold Out'}
          </button>
        </div>
      </div>
    </div>
  );
}
