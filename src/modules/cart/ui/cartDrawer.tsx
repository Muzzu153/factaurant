import { useCart, cartService } from '../cart.store'
import { useState } from 'react'
import { placeOrder } from '../cart.server'

// Helper for money formatting
const formatPrice = (cents: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
    cents / 100,
  )

export function CartDrawer() {
  // We subscribe to the store updates
  const { items, isOpen, total } = useCart()

  // Local Form State
  const [formData, setFormData] = useState({ name: '', address: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Logic: Don't render DOM nodes if closed
  if (!isOpen) return null

  // HANDLE CHECKOUT
  const handleCheckout = async () => {
    try {
      setIsSubmitting(true)
      setError(null)

      // 1. Call the Server Function
      await placeOrder({
        data: {
          customerName: formData.name,
          customerAddress: formData.address,
          items: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            price: i.price,
            name: i.name,
          })),
        },
      })

      // 2. Success!
      alert('Order Placed Successfully!')
      cartService.clear() // Clear the store
      cartService.toggle() // Close the drawer
      setFormData({ name: '', address: '' }) // Reset form
    } catch (err: any) {
      console.error(err)
      // If Zod validation fails, we can show specific errors here
      setError(err.message || 'Failed to place order. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end font-sans">
      {/* 1. BACKDROP */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={cartService.toggle}
      />

      {/* 2. DRAWER PANEL */}
      {/* We use animate-in for smooth entrance */}
      <div className="relative h-full w-full max-w-md bg-white p-6 shadow-xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold font-heading">Your Order</h2>
          <button
            onClick={cartService.toggle}
            className="p-2 hover:bg-slate-100 rounded-full"
          >
            ✕
          </button>
        </div>

        {/* Scrollable List */}
        <div className="flex-1 overflow-y-auto space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <p>Your cart is empty.</p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.productId}
                className="flex gap-4 border-b border-slate-100 pb-4"
              >
                {/* Tiny Image Thumbnail */}
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="h-16 w-16 rounded-md object-cover bg-slate-100"
                  />
                )}

                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium text-slate-900 line-clamp-1">
                      {item.name}
                    </h4>
                    <span className="font-semibold">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center mt-2">
                    <p className="text-sm text-slate-500">
                      Qty: {item.quantity}
                    </p>
                    <button
                      onClick={() => {
                        if (!item.productId) {
                          console.log('Missing product id')
                          return
                        }
                        cartService.remove(item.productId)
                      }}
                      className="text-red-500 text-xs font-medium hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-6 border-t pt-4">
          <div className="flex justify-between text-lg font-bold mb-4 text-slate-900">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>

          {/* INPUT FIELDS */}
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Your Name"
              className="w-full p-3 border border-slate-300 rounded-md"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Delivery Address"
              className="w-full p-3 border border-slate-300 rounded-md"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            onClick={handleCheckout}
            className="w-full py-3 text-white font-bold text-lg bg-blue-600 rounded-theme hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            disabled={
              items.length === 0 ||
              !formData.name ||
              !formData.address ||
              isSubmitting
            }
          >
            {isSubmitting ? 'Placing Order...' : 'Place Order'}
          </button>
        </div>
      </div>
    </div>
  )
}
