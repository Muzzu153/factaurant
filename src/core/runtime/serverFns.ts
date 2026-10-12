import { createServerFn } from "@tanstack/react-start";
import { tenantMiddleware } from "../../modules/tenant/tenant.middleware";
import {authMiddleware} from "../../modules/auth/auth.middleware";


/**
 * PUBLIC FUNCTIONS
 * - No tenant
 * - No scoped DB
 * - Used for bootstrap, previews, landing
 */
export const publicFn = createServerFn({ method: "GET" });

/**
 * TENANT FUNCTIONS
 * - Tenant already resolved
 * - context.db is guaranteed
 */
export const tenantFn = createServerFn({ method: "GET" })
  .middleware([tenantMiddleware]);


  /**
 * - 3. PROTECTED TENANT FUNCTIONS (New!):
 * - Tenant resolved AND User authenticated.
 * - Cross-tenant sessions are blocked.
 * - context.db AND context.user are guaranteed.
 * - Used for administrative mutations, viewing revenue, managing menu items.
 */
  export const protectedTenantFn = tenantFn
  .middleware([authMiddleware]);