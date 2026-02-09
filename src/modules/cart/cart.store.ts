import { Store } from '@tanstack/store'
import { useStore } from '@tanstack/react-store'
import { CartItem } from '../orders/order.schema'

// 1. DOMAIN TYPES
// We define exactly what an item in the cart looks like.
// This is separate from the DB Product type because the cart needs 'quantity'.
// export type CartItem = {
//   productId: string;
//   name: string;
//   price: number;
//   imageUrl?: string | null; // Added image so we can show it in the drawer
//   quantity: number;
// };

// The Shape of our State
type CartState = {
  items: CartItem[]
  isOpen: boolean // Controls the UI Drawer
}

// 2. THE STORE INSTANCE
// This holds the actual data in memory.
export const cartStore = new Store<CartState>({
  items: [],
  isOpen: false,
})

// cartStore.setState()

// 3. DOMAIN LOGIC (Actions)
// We export an object 'cartService' to keep things organized.
// Instead of dispatching vague actions, we call specific methods.
export const cartService = {
  // Toggle the UI
  toggle: () => {
    cartStore.setState((state) => ({ ...state, isOpen: !state.isOpen }))
  },

  // Add Item Logic
  add: (product: {
    id: string
    name: string
    price: number
    imageUrl?: string | null
  }) => {
    cartStore.setState((state) => {
      // Check if item is already in cart
      const existing = state.items.find((item) => item.productId === product.id)

      if (existing) {
        // Increment quantity if exists
        return {
          ...state,
          items: state.items.map((item) =>
            item.productId === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          ),
          isOpen: true, // Auto-open for better UX
        }
      }

      // Add new item if not exists
      return {
        ...state,
        items: [
          ...state.items,
          {
            productId: product.id,
            name: product.name,
            price: product.price,
            imageUrl: product.imageUrl,
            quantity: 1,
          },
        ],
        isOpen: true,
      }
    })
  },

  // Remove Item Logic
  remove: (productId: string) => {
    cartStore.setState((state) => ({
      ...state,
      items: state.items.filter((item) => item.productId !== productId),
    }))
  },

  // Clear logic (for after checkout)
  clear: () => {
    cartStore.setState((state) => ({ ...state, items: [], isOpen: false }))
  },
}

// 4. REACT HOOK
// This connects the Store to React Components.
export const useCart = () => {
  const state = useStore(cartStore)

  // Computed values (Derived State)
  // We calculate these on-the-fly so we don't store redundant data.
  const total = state.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  )
  const count = state.items.reduce((sum, item) => sum + item.quantity, 0)

  return { ...state, total, count }
}
