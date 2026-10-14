// src/modules/cart/cart.store.ts
import { Store } from '@tanstack/store';
import { useStore } from '@tanstack/react-store';
import type { SelectedModifier } from '../../core/db/schema';
import type { ValidatedCouponResult } from '../orders/coupon.schema';

export type CartItem = {
  cartItemId: string;
  productId: string;
  name: string;
  basePrice: number;
  price: number;
  quantity: number;
  imageUrl?: string | null;
  selectedModifiers?: SelectedModifier[];
  itemInstructions?: string;
};

type CartState = {
  items: CartItem[];
  isOpen: boolean;
  appliedCoupon: ValidatedCouponResult | null;
};

export function generateCartItemId(
  productId: string,
  selectedModifiers: SelectedModifier[] = [],
  itemInstructions: string = ''
): string {
  if (selectedModifiers.length === 0 && !itemInstructions) {
    return productId;
  }

  const sortedOptionIds = selectedModifiers
    .map((m) => m.optionId)
    .sort()
    .join(':');

  const normalizedInstructions = itemInstructions.trim().toLowerCase();

  return `${productId}__${sortedOptionIds}__${normalizedInstructions}`;
}

export const cartStore = new Store<CartState>({
  items: [],
  isOpen: false,
  appliedCoupon: null,
});

type SimpleProductInput = {
  id: string;
  name: string;
  price: number;
  imageUrl?: string | null;
};

type CustomizedProductInput = {
  product: SimpleProductInput;
  selectedModifiers?: SelectedModifier[];
  itemInstructions?: string;
  quantity?: number;
};

export const cartService = {
  toggle: () => {
    cartStore.setState((state) => ({ ...state, isOpen: !state.isOpen }));
  },

  open: () => {
    cartStore.setState((state) => ({ ...state, isOpen: true }));
  },

  close: () => {
    cartStore.setState((state) => ({ ...state, isOpen: false }));
  },

  add: (input: SimpleProductInput | CustomizedProductInput) => {
    const payload =
      'product' in input
        ? input
        : { product: input, selectedModifiers: [], itemInstructions: '', quantity: 1 };

    const { product, selectedModifiers = [], itemInstructions = '', quantity = 1 } = payload;
    const modifiersTotal = selectedModifiers.reduce((sum, mod) => sum + mod.price, 0);
    const unitPrice = product.price + modifiersTotal;

    const cartItemId = generateCartItemId(product.id, selectedModifiers, itemInstructions);

    cartStore.setState((state) => {
      const existingIndex = state.items.findIndex((item) => item.cartItemId === cartItemId);

      if (existingIndex > -1) {
        const updatedItems = [...state.items];
        updatedItems[existingIndex] = {
          ...updatedItems[existingIndex],
          quantity: updatedItems[existingIndex].quantity + quantity,
        };

        return {
          ...state,
          items: updatedItems,
          isOpen: true,
        };
      }

      const newItem: CartItem = {
        cartItemId,
        productId: product.id,
        name: product.name,
        basePrice: product.price,
        price: unitPrice,
        quantity,
        imageUrl: product.imageUrl,
        selectedModifiers,
        itemInstructions: itemInstructions.trim() || undefined,
      };

      return {
        ...state,
        items: [...state.items, newItem],
        isOpen: true,
      };
    });
  },

  remove: (cartItemId: string) => {
    cartStore.setState((state) => ({
      ...state,
      items: state.items.filter((item) => item.cartItemId !== cartItemId),
    }));
  },

  updateQuantity: (cartItemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      cartService.remove(cartItemId);
      return;
    }

    cartStore.setState((state) => ({
      ...state,
      items: state.items.map((item) =>
        item.cartItemId === cartItemId ? { ...item, quantity: newQuantity } : item
      ),
    }));
  },

  // Apply verified coupon payload
  applyCoupon: (coupon: ValidatedCouponResult) => {
    cartStore.setState((state) => ({ ...state, appliedCoupon: coupon }));
  },

  // Remove applied coupon
  removeCoupon: () => {
    cartStore.setState((state) => ({ ...state, appliedCoupon: null }));
  },

  clear: () => {
    cartStore.setState((state) => ({
      ...state,
      items: [],
      isOpen: false,
      appliedCoupon: null,
    }));
  },
};

export const useCart = () => {
  const state = useStore(cartStore);

  // Raw subtotal of all items
  const subtotal = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const count = state.items.reduce((sum, item) => sum + item.quantity, 0);

  // Calculate discount (ensures discount never exceeds subtotal)
  const discount = state.appliedCoupon ? Math.min(state.appliedCoupon.discountAmount, subtotal) : 0;
  
  // Tax calculated on discounted subtotal
  const taxableAmount = Math.max(0, subtotal - discount);
  const tax = Math.round(taxableAmount * 0.05); // 5% GST
  const total = taxableAmount + tax;

  return {
    ...state,
    subtotal,
    discount,
    tax,
    total,
    count,
  };
};