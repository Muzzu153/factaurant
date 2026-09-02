import { relations } from "drizzle-orm/relations";
import { tenants, products, orders } from "./schema";

export const productsRelations = relations(products, ({one}) => ({
	tenant: one(tenants, {
		fields: [products.tenantId],
		references: [tenants.id]
	}),
}));

export const tenantsRelations = relations(tenants, ({many}) => ({
	products: many(products),
	orders: many(orders),
}));

export const ordersRelations = relations(orders, ({one}) => ({
	tenant: one(tenants, {
		fields: [orders.tenantId],
		references: [tenants.id]
	}),
}));