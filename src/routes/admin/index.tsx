import { useState } from 'react';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { getAdminOrders } from '@/modules/admin/admin.server';
import { OrderTable } from '@/modules/admin/ui/OrderTable';
import { AddProductForm } from '@/modules/admin/ui/AddProductForm';
import { AdminProductList } from '@/modules/admin/ui/AdminProductList';
import { KdsBoard } from '@/modules/admin/ui/KdsBoard'; //  1. Import KdsBoard
import { getTenant } from '@/modules/tenant/tenant.server';
import { logoutUser } from '@/modules/auth/auth.server';

export const Route = createFileRoute('/admin/')({
  loader: async () => {
    const tenant = await getTenant();
    try {
      const orders = await getAdminOrders();
      return { tenant, orders };
    } catch {
      throw redirect({ to: '/admin/login' });
    }
  },
  component: AdminPage,
});

function AdminPage() {
  const { tenant, orders } = Route.useLoaderData();
  //  2. Add 'kds' to active tab state
  const [activeTab, setActiveTab] = useState<'kds' | 'orders' | 'menu'>('kds');

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      
      {/* 1. Header Bar */}
      <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-30 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-md bg-slate-900 flex items-center justify-center text-white font-bold text-sm">
            {tenant.name[0]}
          </div>
          <div>
            <h1 className="text-base font-bold leading-tight">{tenant.name}</h1>
            <span className="text-[11px] text-slate-400">Restaurant OS</span>
          </div>
        </div>

        {/*  3. Tab Switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('kds')}
            className={`px-3 py-1.5 rounded-md transition cursor-pointer ${
              activeTab === 'kds'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            🍳 Kitchen KDS
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3 py-1.5 rounded-md transition cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            📋 Orders Stream ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('menu')}
            className={`px-3 py-1.5 rounded-md transition cursor-pointer ${
              activeTab === 'menu'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            🍕 Menu & 86ing
          </button>
        </div>

        {/* User Identity & Logout */}
        <div className="flex items-center gap-3">
          <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-mono">
            {tenant.slug}
          </span>
          <button
            onClick={async () => {
              await logoutUser();
              window.location.href = '/admin/login';
            }}
            className="text-xs text-red-600 hover:text-red-700 font-medium cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* 2. Main Workspace */}
      <main className="container mx-auto max-w-6xl p-6 md:p-8">
        
        {/* VIEW 1: KITCHEN DISPLAY SYSTEM */}
        {activeTab === 'kds' && <KdsBoard />}

        {/* VIEW 2: ORDERS RECEIPT STREAM */}
        {activeTab === 'orders' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold">Recent Customer Receipts</h2>
                <p className="text-xs text-slate-500">Historical order log</p>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="px-3 py-1.5 bg-white border border-slate-300 rounded-md text-xs font-medium hover:bg-slate-50 cursor-pointer"
              >
                Refresh
              </button>
            </div>
            <OrderTable orders={orders} />
          </div>
        )}

        {/* VIEW 3: MENU & 86ing */}
        {activeTab === 'menu' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-1">
              <AddProductForm />
            </div>
            <div className="lg:col-span-2">
              <div className="mb-4">
                <h2 className="text-xl font-bold">Menu Inventory & 86ing Board</h2>
                <p className="text-xs text-slate-500">
                  Toggle items on/off instantly when kitchen ingredients run out.
                </p>
              </div>
              <AdminProductList />
            </div>
          </div>
        )}

      </main>
    </div>
  );
}