import { createFileRoute, redirect } from '@tanstack/react-router';
import { getAdminOrders } from '@/modules/admin/admin.server';
import { OrderTable } from '@/modules/admin/ui/OrderTable';
import { AddProductForm } from '@/modules/admin/ui/AddProductForm';
import { getTenant } from '@/modules/tenant/tenant.server';

export const Route = createFileRoute('/admin/')({
    // 1. LOADER: Fetch Tenant + Orders
    loader: async () => {
        // We fetch the tenant mainly to display the name "Pizza King Admin"
        const tenant = await getTenant();

        try {
            const orders = await getAdminOrders();
            return { tenant, orders };
        } catch {
            // 🛡️ Redirect unauthenticated users to the branded login page!
            throw redirect({ to: '/admin/login' });
        }
    },
    component: AdminPage,
});

function AdminPage() {
    const { tenant, orders } = Route.useLoaderData();

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">

            {/* 1. ADMIN HEADER BAR */}
            <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-md bg-slate-900 flex items-center justify-center text-white font-bold text-sm">
                        {tenant.name[0]}
                    </div>
                    <h1 className="text-xl font-bold">
                        {tenant.name} <span className="text-slate-400 font-normal">/ Admin Dashboard</span>
                    </h1>
                </div>

                <div className="text-xs bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full font-mono">
                    tenant: {tenant.slug}
                </div>
            </header>

            {/* 2. DASHBOARD GRID LAYOUT */}
            <main className="container mx-auto max-w-6xl p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                    {/* LEFT COLUMN: Add Product Form */}
                    <div className="lg:col-span-1">
                        <AddProductForm onSuccess={() => window.location.reload()} />
                    </div>

                    {/* RIGHT COLUMN: Incoming Orders Stream */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold">Recent Customer Orders</h2>
                            <button
                                onClick={() => window.location.reload()}
                                className="px-3 py-1.5 bg-white border border-slate-300 rounded-md text-xs font-medium hover:bg-slate-50 transition"
                            >
                                Refresh Orders
                            </button>
                        </div>

                        <OrderTable orders={orders} />
                    </div>

                </div>
            </main>
        </div>
    );
}