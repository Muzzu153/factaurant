import { createFileRoute } from '@tanstack/react-router';
import { getTenant } from '@/modules/tenant/tenant.server';
import { OrderTracker } from '@/modules/orders/ui/OrderTracker';

export const Route = createFileRoute('/orders/$orderId')({
  loader: async () => {
    // Resolve tenant for layout context & theme variables
    const tenant = await getTenant();
    return { tenant };
  },
  component: OrderTrackingPage,
});

function OrderTrackingPage() {
  const { tenant } = Route.useLoaderData();
  const { orderId } = Route.useParams();

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 font-sans">
      <div className="max-w-2xl mx-auto mb-6 text-center">
        <a href="/" className="inline-block text-xl font-extrabold font-heading text-slate-900 hover:opacity-80">
          {tenant.name}
        </a>
      </div>

      <OrderTracker orderId={orderId} />

      <div className="max-w-2xl mx-auto mt-6 text-center">
        <a href="/" className="text-xs font-semibold text-primary hover:underline">
          ← Back to Menu
        </a>
      </div>
    </div>
  );
}