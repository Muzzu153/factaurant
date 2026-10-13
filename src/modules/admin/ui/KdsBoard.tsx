import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAdminOrders } from '../admin.server';
import { updateOrderStatus } from '@/modules/orders/order.server';
import { playKitchenChime } from '@/core/utils/audio';
import type { OrderStatus } from '@/modules/orders/order.schema';
import type { orders } from '@/core/db/schema';

type Order = typeof orders.$inferSelect;

// Helper: Calculate elapsed minutes
function getElapsedMinutes(createdAt: Date | string | null): number {
  if (!createdAt) return 0;
  return Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000);
}

export function KdsBoard() {
  const queryClient = useQueryClient();
  const prevPendingCountRef = useRef<number | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(false);

  // 1. Live Kitchen Polling (Refetches every 4 seconds)
  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => getAdminOrders(),
    refetchInterval: 4000,
  });

  const allOrders: Order[] = ordersData || [];

  // Filter into the 3 kitchen workstations
  const newOrders = allOrders.filter((o) => o.status === 'pending');
  const cookingOrders = allOrders.filter((o) => o.status === 'accepted' || o.status === 'preparing');
  const readyOrders = allOrders.filter((o) => o.status === 'ready');

  // 2. Audio Chime Trigger when new pending orders arrive
  useEffect(() => {
    if (prevPendingCountRef.current !== null && newOrders.length > prevPendingCountRef.current) {
      if (audioEnabled) {
        playKitchenChime();
      }
    }
    prevPendingCountRef.current = newOrders.length;
  }, [newOrders.length, audioEnabled]);

  // 3. One-Tap Status Progression Mutation
  const statusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: OrderStatus }) => {
      return await updateOrderStatus({
        data: { orderId, status },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
    },
    onError: (err: any) => {
      alert(`Action failed: ${err.message}`);
    },
  });

  if (isLoading) {
    return <div className="p-12 text-center text-slate-400 font-sans">Connecting to kitchen feed...</div>;
  }

  return (
    <div className="font-sans">
      
      {/* KDS Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 bg-slate-900 text-white p-4 rounded-xl shadow-xs">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <span>🍳 Kitchen Display System</span>
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" title="Live Feed Active" />
          </h2>
          <p className="text-xs text-slate-400">Live order queue • Updates every 4s</p>
        </div>

        {/* Audio Alert Toggle */}
        <button
          onClick={() => {
            setAudioEnabled((prev) => !prev);
            playKitchenChime(); // Play test chime
          }}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
            audioEnabled
              ? 'bg-emerald-600 text-white hover:bg-emerald-500'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <span>{audioEnabled ? '🔔 Sound: ON' : '🔕 Sound: OFF (Click to Enable)'}</span>
        </button>
      </div>

      {/* The 3 Workstation Lanes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        
        {/* ==================================================================== */}
        {/* LANE 1: NEW INCOMING ORDERS (Pending)                                */}
        {/* ==================================================================== */}
        <div className="bg-slate-100/70 border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              New Tickets ({newOrders.length})
            </h3>
          </div>

          <div className="space-y-4">
            {newOrders.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">No pending tickets.</p>
            ) : (
              newOrders.map((order) => (
                <KdsTicketCard
                  key={order.id}
                  order={order}
                  actionLabel="✓ Accept Order"
                  actionColor="bg-amber-600 hover:bg-amber-500 text-white"
                  onAction={() => statusMutation.mutate({ orderId: order.id, status: 'accepted' })}
                  isMutating={statusMutation.isPending}
                />
              ))
            )}
          </div>
        </div>

        {/* ==================================================================== */}
        {/* LANE 2: ACTIVE IN KITCHEN (Accepted & Preparing)                     */}
        {/* ==================================================================== */}
        <div className="bg-slate-100/70 border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              In the Kitchen ({cookingOrders.length})
            </h3>
          </div>

          <div className="space-y-4">
            {cookingOrders.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">Kitchen is clear.</p>
            ) : (
              cookingOrders.map((order) => {
                const isAccepted = order.status === 'accepted';
                return (
                  <KdsTicketCard
                    key={order.id}
                    order={order}
                    actionLabel={isAccepted ? '🍳 Start Cooking' : '✓ Mark Ready'}
                    actionColor={
                      isAccepted
                        ? 'bg-blue-600 hover:bg-blue-500 text-white'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                    }
                    onAction={() =>
                      statusMutation.mutate({
                        orderId: order.id,
                        status: isAccepted ? 'preparing' : 'ready',
                      })
                    }
                    isMutating={statusMutation.isPending}
                  />
                );
              })
            )}
          </div>
        </div>

        {/* ==================================================================== */}
        {/* LANE 3: READY FOR DISPATCH / PICKUP (Ready)                          */}
        {/* ==================================================================== */}
        <div className="bg-slate-100/70 border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Ready for Dispatch ({readyOrders.length})
            </h3>
          </div>

          <div className="space-y-4">
            {readyOrders.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">No packed orders.</p>
            ) : (
              readyOrders.map((order) => (
                <KdsTicketCard
                  key={order.id}
                  order={order}
                  actionLabel="🚀 Complete & Dispatched"
                  actionColor="bg-emerald-600 hover:bg-emerald-500 text-white"
                  onAction={() => statusMutation.mutate({ orderId: order.id, status: 'delivered' })}
                  isMutating={statusMutation.isPending}
                />
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

// 🎫 REUSABLE HIGH-CONTRAST KITCHEN TICKET CARD
function KdsTicketCard({
  order,
  actionLabel,
  actionColor,
  onAction,
  isMutating,
}: {
  order: Order;
  actionLabel: string;
  actionColor: string;
  onAction: () => void;
  isMutating: boolean;
}) {
  const elapsed = getElapsedMinutes(order.createdAt);
  const items = Array.isArray(order.items) ? order.items : [];

  // Elapsed time urgency badge (turns yellow after 8m, red after 15m)
  const timerBadgeColor =
    elapsed >= 15
      ? 'bg-red-500 text-white animate-pulse'
      : elapsed >= 8
      ? 'bg-amber-100 text-amber-800'
      : 'bg-slate-100 text-slate-600';

  return (
    <div className="bg-white border-2 border-slate-200 rounded-xl p-4 shadow-sm flex flex-col justify-between transition hover:border-slate-300">
      
      {/* Top Meta: Order ID & Timer */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="font-mono text-xs font-bold text-slate-900">
            #{order.id.slice(0, 6)}
          </span>
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${timerBadgeColor}`}>
            ⏱️ {elapsed}m ago
          </span>
        </div>

        {/* Customer & Address */}
        <div className="text-xs text-slate-500 mb-3 border-b border-slate-100 pb-2">
          <strong className="text-slate-800">{order.customerName}</strong>
          <span className="block truncate text-[11px]">{order.customerAddress}</span>
        </div>

        {/* Large Kitchen Line Items */}
        <div className="space-y-1.5 mb-4">
          {items.map((item: any, idx: number) => (
            <div key={idx} className="flex items-baseline justify-between text-xs font-semibold text-slate-900">
              <span className="text-sm font-bold text-slate-900">
                <span className="text-primary">{item.quantity}x</span> {item.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom One-Tap Kitchen Button */}
      <button
        onClick={onAction}
        disabled={isMutating}
        className={`w-full py-2.5 rounded-lg font-bold text-xs shadow-xs transition active:scale-98 cursor-pointer disabled:opacity-50 ${actionColor}`}
      >
        {actionLabel}
      </button>
    </div>
  );
}