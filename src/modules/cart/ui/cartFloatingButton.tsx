import { useCart, cartService } from '../cart.store';

export function CartFloatingButton() {
  const { count } = useCart();

  // UX Rule: Don't show the button if there is nothing to buy
  if (count === 0) return null;

  return (
    <button
      onClick={cartService.toggle}
      className="fixed bottom-6 right-6 flex items-center gap-2 px-6 py-3 text-white shadow-lg bg- rounded-theme hover:scale-105 transition z-40 animate-in fade-in zoom-in duration-300"
    >
      <span>🛒 View Cart</span>
      <span className="bg-green-600 text-black text-xs font-bold px-2 py-1 rounded-full min-w-[20px] text-center">
        {count}
      </span>
    </button>
  );
}