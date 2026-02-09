import { tenantFn } from '../../core/runtime/serverFns'; // Your secure builder
import { createOrderService } from '../orders/order.service';
import { OrderInputSchema } from '../orders/order.schema';

export const placeOrder = tenantFn
  // 1. ATTACH ZOD VALIDATOR
  // If the input is bad, TanStack Start throws an error automatically.
  .inputValidator(OrderInputSchema)
  
  // 2. HANDLE THE REQUEST
  .handler(async ({ context, data }) => {
    // 'data' is the validated input (CreateOrderInput)
    // 'context.db' is the Secure DB Wrapper
    
    // We delegate the work to the service
    const order = await createOrderService.placeOrder(context.db, data);
    
    return { success: true, orderId: order.id };
  });