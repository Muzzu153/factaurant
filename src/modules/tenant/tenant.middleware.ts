// CONTROL PLANE ONLY
// This file:
// - resolves tenant identity
// - creates tenant-scoped DB
// - injects it into context
// Business logic MUST NOT live here
import { createMiddleware } from '@tanstack/react-start';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { notFound } from '@tanstack/react-router';
import { eq } from 'drizzle-orm';
import { db } from '../../core/db/client';
import { env } from '../../core/runtime/env.server';
import { tenants } from '../../core/db/schema';
import { createTenantScope } from '../../core/db/tenant-scope';


// 1. DEFINE THE MIDDLEWARE
// This acts as a "Guard" that runs before your actual function.
export const tenantMiddleware = createMiddleware().server(async ({ next }) => {
    let tenantId: string | null = null;
    let tenantName = '';

    // A. Check for "Single Tenant" Mode (The Ejection Plan)
    if (env.APP_DEPLOYMENT_MODE === 'single') {
        // --- SINGLE TENANT MODE (Ejection/Enterprise) ---
        const forcedId = env.SINGLE_TENANT_ID;
        if (!forcedId) throw new Error("APP_DEPLOYMENT_MODE is SINGLE, but ID is missing.");

        const tenant = await db.query.tenants.findFirst({
            where: eq(tenants.id, forcedId),
            columns: { id: true, name: true },
        })

        if (!tenant) throw new Error(`Single Tenant ${forcedId} not found in database.`);

        tenantId = forcedId,
            tenantName = tenant.name // Placeholder

    } else {
        // B. Multi-Tenant Mode (The Concierge)
        // IMPORTANT:
        // Tenant identity is resolved ONLY from deployment config (SINGLE)
        // or from the request host. Never from client input.
        const headers = getRequestHeaders();
        const host = headers.get('host') || '';
        let slug = host.split('.')[0];

        // Localhost Dev Fallback
        if (slug.includes('localhost')) slug = 'pizza-king';

        // Query DB
        const tenant = await db.query.tenants.findFirst({
            where: eq(tenants.slug, slug),
            columns: { id: true, name: true },
            // We only fetch what we need for security context
        });


        // If no tenant is found, we STOP execution right here.
        // The 'next()' function is NEVER called. The request dies.
        if (!tenant) {
            console.error(`Request rejected: Unknown slug '${slug}'`);
            throw notFound();
        }


        tenantId = tenant.id;
        tenantName = tenant.name;

    }

    // Invariant enforcement
    if (!tenantId) {
        throw new Error("Invariant violation: tenantId not resolved");
    }


    // HERE IS THE UPGRADE
    // We initialize the Safe DB Wrapper right here.
    const scopedDb = Object.freeze(createTenantScope(tenantId));

    console.info(`[tenant:${tenantId}] request accepted`);

    return next({
        context: {
            tenant: {
                id: tenantId,
                name: tenantName,
                mode: env.APP_DEPLOYMENT_MODE ?? 'shared',
            },
            // We add the Safe DB to the context
            db: scopedDb,
        }
    });
});
