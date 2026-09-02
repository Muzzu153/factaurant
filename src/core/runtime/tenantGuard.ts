import { invariant } from "./invariant";

export function requireTenant(context: any) {
    invariant(context?.tenant?.id, 'Tenant context is missing')
    invariant(context?.db, 'Tenant DB is missing')

    return {
        tenandId: context.tenant.id,
        db: context.db
    }
}

