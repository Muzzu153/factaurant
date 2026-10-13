import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getMenu, getCategories } from '../menu.server';
import { ProductCard } from './ProductCard';
import { CategoryTabs } from './CategoryTabs';
import type { products } from '../../../core/db/schema';

type Product = typeof products.$inferSelect;

export function MenuGrid() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [vegOnly, setVegOnly] = useState(false);

  // 1. Fetch menu products
  const { data: productsData, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['menu'],
    queryFn: () => getMenu(),
  });

  // 2. Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => getCategories(),
  });

  if (isLoadingProducts) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-72 bg-slate-100 rounded-theme" />
        ))}
      </div>
    );
  }

  const allProducts: Product[] = productsData || [];
  const categoriesList = categoriesData || [];

  // ⚡ 3. DYNAMIC FILTERING (Category + Veg Only)
  const filteredProducts = allProducts.filter((p) => {
    const matchesCategory = !selectedCategory || p.categoryId === selectedCategory;
    const matchesDiet = !vegOnly || p.dietaryType === 'veg' || p.dietaryType === 'vegan';
    return matchesCategory && matchesDiet;
  });

  return (
    <div className="w-full">
      {/* Category Navigation Bar (only renders if categories exist or items are present) */}
      <CategoryTabs
        categories={categoriesList}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        vegOnly={vegOnly}
        onToggleVegOnly={() => setVegOnly((prev) => !prev)}
      />

      {/* Grid of Product Cards */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center border-2 border-dashed border-slate-200 rounded-lg">
          <p className="text-slate-500 text-sm">No items match your filter criteria.</p>
          <button
            onClick={() => {
              setSelectedCategory(null);
              setVegOnly(false);
            }}
            className="mt-3 text-xs font-semibold text-primary underline cursor-pointer"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}