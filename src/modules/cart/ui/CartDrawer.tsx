// src/modules/cart/ui/CartDrawer.tsx
import { useState } from 'react';
import { useCart, cartService, type CartItem } from '../cart.store';
import { placeOrder } from '../cart.server';
import { validateCoupon } from '@/modules/orders/order.server';
import { img } from '../../../core/utils/image';
import { ProductCustomizationModal } from '@/modules/menu/ui/ProductCustomizationModal';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getMenu } from '@/modules/menu/menu.server';

const formatPrice = (cents: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(cents / 100);

export function CartDrawer() {
  const { items, isOpen, subtotal, discount, tax, total, appliedCoupon } = useCart();

  const [formData, setFormData] = useState({ name: '', address: '' });
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const [editingCartItem, setEditingCartItem] = useState<CartItem | null>(null);

  const { data: products } = useQuery({
    queryKey: ['menu'],
    queryFn: () => getMenu(),
  });

  // Coupon Validation Mutation
  const couponMutation = useMutation({
    mutationFn: async (code: string) => {
      setCouponError(null);
      return await validateCoupon({
        data: {
          code,
          subtotal,
        },
      });
    },
    onSuccess: (result) => {
      cartService.applyCoupon(result);
      setCouponCodeInput('');
      setCouponError(null);
    },
    onError: (err: any) => {
      setCouponError(err.message || 'Invalid coupon code.');
    },
  });

  if (!isOpen) return null;

  const productForEditing = editingCartItem
    ? products?.find((p) => p.id === editingCartItem.productId) || null
    : null;

  const handleEditClick = (item: CartItem) => {
    setEditingCartItem(item);
  };

  const handleSaveUpdatedItem = (oldCartItemId: string, updatedPayload: any) => {
    cartService.remove(oldCartItemId);
    cartService.add(updatedPayload);
    setEditingCartItem(null);
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setCheckoutError(null);

      const result = await placeOrder({
        data: {
          customerName: formData.name,
          customerAddress: formData.address,
          items: items.map((i) => ({
            productId: i.productId,
            name: i.name,
            quantity: i.quantity,
            basePrice: i.basePrice,
            price: i.price,
            selectedModifiers: i.selectedModifiers,
            itemInstructions: i.itemInstructions,
          })),
          couponCode: appliedCoupon?.code,
        },
      });

      cartService.clear();
      setFormData({ name: '', address: '' });
      window.location.href = `/orders/${result.orderId}`;
    } catch (err: any) {
      console.error(err);
      setCheckoutError(err.message || 'Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex justify-end font-sans">
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-xs"
          onClick={cartService.close}
        />

        <div className="relative h-full w-full max-w-md bg-white p-6 shadow-xl flex flex-col animate-in slide-in-from-right duration-300">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h2 className="text-lg font-bold font-heading text-slate-900">Your Order</h2>
            <button
              onClick={cartService.close}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Line Items */}
          <div className="flex-1 overflow-y-auto py-4 space-y-4">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 text-sm">
                <p>Your cart is empty.</p>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.cartItemId}
                  className="flex gap-3 pb-4 border-b border-slate-100 items-start"
                >
                  {item.imageUrl && (
                    <img
                      src={img.cartThumb(item.imageUrl)}
                      alt={item.name}
                      className="h-14 w-14 rounded-md object-cover bg-slate-100 shrink-0 border border-slate-200"
                    />
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-semibold text-slate-900 text-sm truncate">{item.name}</h4>
                      <span className="font-bold text-slate-900 text-sm shrink-0">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>

                    {item.selectedModifiers && item.selectedModifiers.length > 0 && (
                      <div className="mt-1 space-y-0.5">
                        {item.selectedModifiers.map((mod, idx) => (
                          <div key={idx} className="text-[11px] text-slate-500 flex justify-between">
                            <span>+ {mod.optionName}</span>
                            {mod.price > 0 && <span>+{formatPrice(mod.price)}</span>}
                          </div>
                        ))}
                      </div>
                    )}

                    {item.itemInstructions && (
                      <p className="mt-1 text-[11px] italic text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                        Note: {item.itemInstructions}
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center border border-slate-200 rounded-md">
                          <button
                            type="button"
                            onClick={() => cartService.updateQuantity(item.cartItemId, item.quantity - 1)}
                            className="px-2 py-0.5 text-xs text-slate-600 hover:bg-slate-100 cursor-pointer"
                          >
                            -
                          </button>
                          <span className="px-2 text-xs font-semibold text-slate-900">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => cartService.updateQuantity(item.cartItemId, item.quantity + 1)}
                            className="px-2 py-0.5 text-xs text-slate-600 hover:bg-slate-100 cursor-pointer"
                          >
                            +
                          </button>
                        </div>

                        {item.selectedModifiers && item.selectedModifiers.length > 0 && (
                          <button
                            type="button"
                            onClick={() => handleEditClick(item)}
                            className="text-xs text-primary hover:underline font-medium cursor-pointer"
                          >
                            Edit
                          </button>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => cartService.remove(item.cartItemId)}
                        className="text-xs text-red-500 hover:text-red-700 font-medium cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Checkout & Coupon Footer */}
          {items.length > 0 && (
            <div className="pt-3 border-t border-slate-200 space-y-3">
              
              {/* Promo Code Input Box */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded tracking-wide font-mono">
                        {appliedCoupon.code}
                      </span>
                      <span className="text-emerald-700 font-medium">Applied (-{formatPrice(discount)})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => cartService.removeCoupon()}
                      className="text-xs text-red-500 hover:text-red-700 font-medium cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Promo Code (e.g. PIZZA50)"
                        value={couponCodeInput}
                        onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                        className="flex-1 p-1.5 border border-slate-300 rounded text-xs uppercase font-mono tracking-wider focus:outline-none focus:ring-1 focus:ring-slate-900 bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => couponCodeInput.trim() && couponMutation.mutate(couponCodeInput.trim())}
                        disabled={couponMutation.isPending || !couponCodeInput.trim()}
                        className="px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded hover:bg-slate-800 disabled:opacity-50 cursor-pointer"
                      >
                        {couponMutation.isPending ? 'Checking...' : 'Apply'}
                      </button>
                    </div>
                    {couponError && (
                      <p className="text-[11px] text-red-600 mt-1.5 font-medium">{couponError}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Financial Summary */}
              <div className="space-y-1 text-xs text-slate-600 border-b border-slate-100 pb-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium text-slate-900">{formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Discount ({appliedCoupon?.code})</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Taxes (GST 5%)</span>
                  <span>{formatPrice(tax)}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-bold text-slate-900 pt-1 border-t border-slate-100">
                  <span>Total Payable</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              {checkoutError && (
                <p className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200">{checkoutError}</p>
              )}

              {/* Customer Inputs */}
              <form onSubmit={handleCheckout} className="space-y-2">
                <input
                  type="text"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-md text-xs focus:ring-1 focus:ring-slate-900"
                  required
                />
                <input
                  type="text"
                  placeholder="Delivery Address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-md text-xs focus:ring-1 focus:ring-slate-900"
                  required
                />

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 bg-slate-900 text-white font-bold text-xs rounded-md hover:bg-slate-800 disabled:opacity-50 cursor-pointer transition"
                >
                  {isSubmitting ? 'Placing Order...' : `Pay on Delivery • ${formatPrice(total)}`}
                </button>
              </form>

            </div>
          )}

        </div>
      </div>

      {editingCartItem && productForEditing && (
        <ProductCustomizationModal
          product={productForEditing}
          initialItem={editingCartItem}
          isOpen={Boolean(editingCartItem)}
          onClose={() => setEditingCartItem(null)}
          onSaveUpdatedItem={handleSaveUpdatedItem}
        />
      )}
    </>
  );
}