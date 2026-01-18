import type { orders } from '../../../core/db/schema';

// Helper types
type Order = typeof orders.$inferSelect;

const formatPrice = (cents: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);

const formatDate = (date: Date | null) => 
  date ? new Date(date).toLocaleString() : 'N/A';

export function OrderTable({ orders }: { orders: Order[] }) {
  if (orders.length === 0) {
    return (
      <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-lg">
        <p className="text-slate-500 text-lg">No orders received yet.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 shadow-sm">
      <table className="w-full text-left text-sm text-slate-600">
        <thead className="bg-slate-50 text-slate-900 font-bold uppercase text-xs">
          <tr>
            <th className="p-4">Order ID</th>
            <th className="p-4">Customer</th>
            <th className="p-4">Items</th>
            <th className="p-4">Total</th>
            <th className="p-4">Status</th>
            <th className="p-4">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {orders.map((order) => {
            // Parse the JSON items (since we stored them as jsonb)
            const itemsList = Array.isArray(order.items) ? order.items : [];

            return (
              <tr key={order.id} className="hover:bg-slate-50 transition">
                <td className="p-4 font-mono text-xs text-slate-400">
                  {order.id.slice(0, 8)}...
                </td>
                <td className="p-4">
                  <div className="font-semibold text-slate-900">{order.custormerName}</div>
                  <div className="text-xs text-slate-400">{order.customerAddress}</div>
                </td>
                <td className="p-4">
                  <div className="space-y-1">
                    {itemsList.map((item: any, idx: number) => (
                      <div key={idx} className="text-xs">
                        {item.quantity}x {item.name || 'Product'}
                      </div>
                    ))}
                  </div>
                </td>
                <td className="p-4 font-bold text-slate-900">
                  {formatPrice(order.totalAmount)}
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold 
                    ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 
                      order.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-slate-100'}`
                  }>
                    {order.status.toUpperCase()}
                  </span>
                </td>
                <td className="p-4 text-xs whitespace-nowrap">
                  {formatDate(order.createdAt)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}