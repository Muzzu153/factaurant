
import { useQuery } from '@tanstack/react-query';
import { trackOrder } from '../order.server';
import type { OrderStatus } from '../order.schema';

const formatPrice = (cents: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(cents / 100);

// Visual stages for the customer timeline
const STAGES: { key: OrderStatus; label: string; desc: string }[] = [
  { key: 'pending', label: 'Order Received', desc: 'Waiting for kitchen confirmation' },
  { key: 'accepted', label: 'Accepted', desc: 'Kitchen acknowledged the ticket' },
  { key: 'preparing', label: 'Cooking in Progress', desc: 'Chefs are preparing your meal' },
  { key: 'ready', label: 'Ready for Pickup / Delivery', desc: 'Packed and ready to go' },
  { key: 'delivered', label: 'Delivered', desc: 'Enjoy your meal!' },
];

export function OrderTracker({ orderId }: { orderId: string }) {
  // ⚡ 1. SMART POLLING QUERY: Auto-refetches every 3s until delivered/cancelled
  const { data: order, isLoading, error } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => trackOrder({ data: { orderId } }),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      // Stop polling when terminal state is reached
      if (status === 'delivered' || status === 'cancelled') return false;
      return 3000; // Poll every 3 seconds
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center text-slate-500 font-sans">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-900 border-r-transparent align-[-0.125em] mb-4" />
        <p>Loading live order status...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center bg-red-50 border border-red-200 rounded-lg text-red-700 font-sans">
        <h3 className="font-bold text-lg mb-1">Order Not Found</h3>
        <p className="text-sm">We could not locate this order. Please verify your order link.</p>
      </div>
    );
  }

  const currentStatus = order.status as OrderStatus;
  const isCancelled = currentStatus === 'cancelled';
  const currentIndex = STAGES.findIndex((s) => s.key === currentStatus);

  return (
    <div className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-xl shadow-xs p-6 md:p-8 font-sans">
      
      {/* 1. Header with Status Badge */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6 mb-6">
        <div>
          <span className="text-xs uppercase font-mono tracking-wider text-slate-400">Order ID</span>
          <h2 className="text-xl font-bold text-slate-900 font-mono">{order.id}</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Placed on {new Date(order.createdAt!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        {/* Live Status Pill */}
        <div>
          {isCancelled ? (
            <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-red-100 text-red-800 uppercase tracking-wider">
              Order Cancelled
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase tracking-wider">
              <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
              {currentStatus.replace('_', ' ')}
            </span>
          )}
        </div>
      </div>

      {/* 2. Visual Progress Timeline (Hidden if cancelled) */}
      {!isCancelled && (
        <div className="mb-8">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-6">
            Live Kitchen Progress
          </h3>

          <div className="space-y-6 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
            {STAGES.map((stage, idx) => {
              const isPast = idx < currentIndex;
              const isCurrent = idx === currentIndex;

              return (
                <div key={stage.key} className="flex items-start gap-4 relative">
                  {/* Step Icon Indicator */}
                  <div
                    className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors duration-300 z-10 ${
                      isPast
                        ? 'bg-emerald-600 text-white'
                        : isCurrent
                        ? 'bg-slate-900 text-white ring-4 ring-slate-100'
                        : 'bg-white border-2 border-slate-200 text-slate-400'
                    }`}
                  >
                    {isPast ? '✓' : idx + 1}
                  </div>

                  {/* Stage Text */}
                  <div>
                    <h4
                      className={`text-sm font-bold ${
                        isCurrent ? 'text-slate-900 font-heading text-base' : isPast ? 'text-slate-800' : 'text-slate-400'
                      }`}
                    >
                      {stage.label}
                    </h4>
                    <p className={`text-xs ${isCurrent ? 'text-slate-600 font-medium' : 'text-slate-400'}`}>
                      {stage.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Delivery Details */}
      <div className="bg-slate-50 rounded-lg p-4 mb-6 border border-slate-100 text-xs">
        <h4 className="font-bold text-slate-900 mb-2">Delivery Information</h4>
        <div className="grid grid-cols-2 gap-2 text-slate-600">
          <div>
            <span className="text-slate-400 block">Recipient:</span>
            <strong>{order.customerName}</strong>
          </div>
          <div>
            <span className="text-slate-400 block">Address:</span>
            <span>{order.customerAddress}</span>
          </div>
        </div>
      </div>

         {/* 4. Itemized Receipt */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Order Receipt</h4>
        <div className="divide-y divide-slate-100 text-xs">
          {(order.items as any[]).map((item, idx) => (
            <div key={idx} className="py-3 text-slate-800">
              <div className="flex justify-between items-start">
                <span className="font-semibold text-slate-900">
                  {item.quantity}x {item.name}
                </span>
                <span className="font-medium text-slate-900">{formatPrice(item.price * item.quantity)}</span>
              </div>

              {/* Modifiers breakdown */}
              {item.selectedModifiers && item.selectedModifiers.length > 0 && (
                <div className="mt-1 pl-3 space-y-0.5 border-l-2 border-slate-200 text-[11px] text-slate-500">
                  {item.selectedModifiers.map((mod: any, mIdx: number) => (
                    <div key={mIdx} className="flex justify-between">
                      <span>• {mod.optionName}</span>
                      {mod.price > 0 && <span>+{formatPrice(mod.price)}</span>}
                    </div>
                  ))}
                </div>
              )}

              {/* Cooking note */}
              {item.itemInstructions && (
                <p className="mt-1 text-[11px] text-slate-500 italic">
                  Note: "{item.itemInstructions}"
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Total Summary */}
        <div className="border-t border-slate-200 pt-3 mt-2 space-y-1 text-xs">
          <div className="flex justify-between text-slate-500">
            <span>Subtotal</span>
            <span>{formatPrice(order.subtotalAmount)}</span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>Taxes & GST (5%)</span>
            <span>{formatPrice(order.taxAmount)}</span>
          </div>
          <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-100">
            <span>Total Paid</span>
            <span>{formatPrice(order.totalAmount)}</span>
          </div>
        </div>
      </div>

    </div>
  );
}