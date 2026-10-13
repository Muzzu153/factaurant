import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMenu } from '@/modules/menu/menu.server';
import { toggleProductAvailability } from '../admin.server';
import { img } from '@/core/utils/image';
import { DietaryBadge } from '@/modules/menu/ui/DietaryBadge';
import type { products } from '@/core/db/schema';

type Product = typeof products.$inferSelect;

const formatPrice = (cents: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(cents / 100);

export function AdminProductList() {
  const queryClient = useQueryClient();
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // 1. Fetch current menu items
  const { data: productsData, isLoading } = useQuery({
    queryKey: ['menu'],
    queryFn: () => getMenu(),
  });

  // 2. 1-Click Availability Mutation (86ing)
  const toggleMutation = useMutation({
    mutationFn: async ({ productId, isAvailable }: { productId: string; isAvailable: boolean }) => {
      setTogglingId(productId);
      return await toggleProductAvailability({
        data: { productId, isAvailable },
      });
    },
    onSuccess: () => {
      // Refresh menu query cache across admin and storefront
      queryClient.invalidateQueries({ queryKey: ['menu'] });
    },
    onError: (err: any) => {
      alert(`Failed to update item availability: ${err.message}`);
    },
    onSettled: () => {
      setTogglingId(null);
    },
  });

  if (isLoading) {
    return <div className="p-8 text-center text-slate-400 text-sm">Loading inventory...</div>;
  }

  const items: Product[] = productsData || [];

  if (items.length === 0) {
    return (
      <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-lg text-slate-500 text-sm">
        No menu items created yet. Use the form above to add your first dish.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xs">
      <table className="w-full text-left text-sm text-slate-600">
        <thead className="bg-slate-50 text-slate-900 font-bold uppercase text-xs border-b border-slate-200">
          <tr>
            <th className="p-3">Item</th>
            <th className="p-3">Diet</th>
            <th className="p-3">Price</th>
            <th className="p-3 text-right">Status (86ing)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {items.map((item) => {
            const isTogglingThis = togglingId === item.id;

            return (
              <tr key={item.id} className="hover:bg-slate-50/70 transition">
                {/* 1. Item Image & Name */}
                <td className="p-3 flex items-center gap-3">
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md bg-slate-100 border border-slate-200">
                    {item.imageUrl ? (
                      <img
                        src={img.adminTableThumb(item.imageUrl)}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[9px] text-slate-400">
                        No img
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">{item.name}</div>
                    <div className="text-xs text-slate-400 line-clamp-1">{item.description}</div>
                  </div>
                </td>

                {/* 2. Dietary Badge */}
                <td className="p-3">
                  <DietaryBadge dietaryType={item.dietaryType as any} showLabel />
                </td>

                {/* 3. Formatted Price */}
                <td className="p-3 font-semibold text-slate-900">
                  {formatPrice(item.price)}
                </td>

                {/* 4. Instant Availability Toggle Switch */}
                <td className="p-3 text-right">
                  <button
                    onClick={() =>
                      toggleMutation.mutate({
                        productId: item.id,
                        isAvailable: !item.isAvailable,
                      })
                    }
                    disabled={isTogglingThis}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer ${
                      item.isAvailable
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                        : 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                    } ${isTogglingThis ? 'opacity-50 cursor-wait' : ''}`}
                    title="Click to toggle availability"
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${
                        item.isAvailable ? 'bg-emerald-600' : 'bg-red-600'
                      }`}
                    />
                    {isTogglingThis
                      ? 'Updating...'
                      : item.isAvailable
                      ? 'In Stock'
                      : 'Sold Out (86ed)'}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}