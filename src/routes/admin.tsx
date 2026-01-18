import { createFileRoute } from '@tanstack/react-router';
import { getAdminOrders } from '../modules/admin/admin.server';
import { OrderTable } from '@/modules/admin/ui/OrderTable';
import { getTenant } from '../modules/tenant/tenant.server';

export const Route = createFileRoute('/admin')({
  // 1. LOADER: Fetch Tenant + Orders
  loader: async () => {
    // We fetch the tenant mainly to display the name "Pizza King Admin"
    const tenant = await getTenant();
    const orders = await getAdminOrders();
    
    return { tenant, orders };
  },
  component: AdminPage,
});

function AdminPage() {
  const { tenant, orders } = Route.useLoaderData();

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Admin Header */}
      <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-md bg-slate-900 flex items-center justify-center text-white font-bold">
            {tenant.name[0]}
          </div>
          <h1 className="text-xl font-bold">
            {tenant.name} <span className="text-slate-400 font-normal">/ Dashboard</span>
          </h1>
        </div>
        <div className="text-sm text-slate-500">
          Admin Mode
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto max-w-6xl p-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">Recent Orders</h2>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-white border border-slate-300 rounded-md text-sm hover:bg-slate-50"
          >
            Refresh
          </button>
        </div>

        <OrderTable orders={orders} />
      </main>
    </div>
  );
}