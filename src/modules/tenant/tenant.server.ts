import { getRequestHeaders } from "@tanstack/react-start/server"
import { db } from "@/core/db/client";
import { eq } from "drizzle-orm";
import { notFound } from "@tanstack/react-router";
import { tenants } from "@/core/db/schema.ts";
import { publicFn } from "@/core/runtime/serverFns";

//  This function runs only on the server.
export const getTenant = publicFn.handler(
    async () => {

        // GET the host headers
        // This is how we know which domain th user typed
        // e.g., "pizza-king.localhost:3000" or myapp.com
        const headers = getRequestHeaders();
        const host = headers.get('host') || '';

        // Parse the subdomain (the slug)
        // we want to extract "pizza-king" from "pizza-king.localhost:3000"
        let slug = host.split('.')[0];

        // DEV Mode fallback
        // If we just vist "localhost:3000", lets default to pizza-king
        // so the app doesn't crash while we are testing basics
        if (slug.includes('localhost')) {
            slug = 'pizza-king';
        }

        console.log(`Concierge looking for: ${slug}`);

        // 4. QUERY THE DATABASE
        const tenant = await db.query.tenants.findFirst({
            where: eq(tenants.slug, slug),
        })
        // HANDLE 'shop not found'
        // If someone types 'fake-shop.localhost', we thorw a 404
        if (!tenant) {
            throw notFound();
        }

        return tenant;
    })