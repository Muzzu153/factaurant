import type { TenantScope } from '../../core/db/tenant-scope';
import type { OrderInput } from '../orders/order.schema';
import { calculateCartTotal } from '../orders/order.service';


// 2. THE BUSINESS LOGIC
// This function doesn't know about HTTP or TanStack Start.
// It only knows about the Database Wrapper (TenantScope).
export const cartService = {
  placeOrder: async (db: TenantScope, input: OrderInput) => {
    
    // A. Calculate Total on Server (Trust but Verify)
    const calculatedTotal = calculateCartTotal(input.items)

    // B. Write to Database using the SAFE Wrapper
    // Notice: We don't need to pass tenantId. The 'db' object already has it locked.
    const [newOrder] = await db.orders.create({
      custormerName: input.customerName,
      customerAddress: input.customerAddress,
      items: input.items, // Storing JSON blob for MVP
      totalAmount: calculatedTotal,
      status: 'pending',
    });

    console.log(`✅ Order placed: ${newOrder.id} for $${calculatedTotal / 100}`);
    
    return newOrder;
  }
};