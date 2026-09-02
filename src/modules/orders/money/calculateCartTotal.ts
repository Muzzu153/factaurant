import { CartItem } from "../order.schema";

export const calculateCartTotal = (items: CartItem[]) => {
    if (items.length === 0) return 0

    return items.reduce((sum, item) => {
        if (item.price < 0) {
            throw new Error('Item price cannot be negative');
        }

        if (item.quantity <= 0) {
            throw new Error("Items quantity must be greater than 0")
        }

        return sum + item.price * item.quantity
    }, 0)
}

