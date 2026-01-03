import { createServerFn } from "@tanstack/react-start";
import { db } from "@/core/db";
import { products } from "@/core/db/schema";
import { eq } from "drizzle-orm";
import { z } from 'zod'


const TenantId = z.object({
    tenantId: z.uuid(),
})

// 1. Define the server function
// We mark this as GET because we are just fetching data, not chagning it.
export const getProducts = createServerFn({ method: 'GET' })

    // This is the arguments are defined in the sever functions in Tanstack start
    .inputValidator(TenantId)
    // .inputValidator((data: { tenantId: string }) => data)
    .handler(async ({ data }) => {

        // 2. QUERY THE DATABASE
        // db.select() -> "SELECT * FROM  products"
        // .from(producst) -> "FROM products"
        // .where(...) -> "WHERE tenant_id = 'uuid-of-pizza-king'"
        const items = await db
            .select()
            .from(products)
            .where(eq(products.tenantId, data.tenantId));

        return items;

    })