import { relations } from "drizzle-orm/relations";
import { tenants, users, orders, products } from "./schema";

export const usersRelations = relations(users, ({one}) => ({
	tenant: one(tenants, {
		fields: [users.tenantId],
		references: [tenants.id]
	}),
}));

export const tenantsRelations = relations(tenants, ({many}) => ({
	users: many(users),
	orders: many(orders),
	products: many(products),
}));

export const ordersRelations = relations(orders, ({one}) => ({
	tenant: one(tenants, {
		fields: [orders.tenantId],
		references: [tenants.id]
	}),
}));

export const productsRelations = relations(products, ({one}) => ({
	tenant: one(tenants, {
		fields: [products.tenantId],
		references: [tenants.id]
	}),
}));