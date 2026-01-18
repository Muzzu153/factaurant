import { useQuery } from '@tanstack/react-query';
import { getMenu } from '../menu.server'; // Your RPC
import { ProductCard } from './ProductCard';

export function MenuGrid() {
  // Component fetches its own data!
  const { data: products } = useQuery({
    queryKey: ['menu'],
    queryFn: () => getMenu(), // Server Function
  });

  if (!products) return <div>Loading menu...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {products.map(p => <ProductCard key={p.id} product={p} />)}
    </div>
  );
}