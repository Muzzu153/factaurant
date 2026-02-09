import { createServerFn } from "@tanstack/react-start";
import { tenantMiddleware } from "../../modules/tenant/tenant.middleware";

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
