import { tenantFn } from '../../core/runtime/serverFns'; // Your secure builder
import { cartService } from './cart.service';
import { OrderSchema } from '../orders/order.schema';

export const placeOrder = tenantFn
  // 1. ATTACH ZOD VALIDATOR
  // If the input is bad, TanStack Start throws an error automatically.
  .inputValidator(OrderSchema)
  
  // 2. HANDLE THE REQUEST
  .handler(async ({ context, data }) => {
    // 'data' is the validated input (CreateOrderInput)
    // 'context.db' is the Secure DB Wrapper
    
    // We delegate the work to the service
    const order = await cartService.placeOrder(context.db, data);
    
    return { success: true, orderId: order.id };
  });