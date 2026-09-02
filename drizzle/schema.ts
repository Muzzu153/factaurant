import { pgTable, unique, uuid, text, jsonb, foreignKey, integer, boolean, timestamp } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const tenants = pgTable("tenants", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	slug: text().notNull(),
	name: text().notNull(),
	theme: jsonb().notNull(),
	pages: jsonb().notNull(),
	blocks: jsonb().notNull(),
}, (table) => [
	unique("tenants_slug_unique").on(table.slug),
]);

export const products = pgTable("products", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	tenantId: uuid("tenant_id").notNull(),
	name: text().notNull(),
	description: text(),
	price: integer().notNull(),
	imageUrl: text("image_url"),
	isAvailable: boolean("is_available").default(true).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.tenantId],
			foreignColumns: [tenants.id],
			name: "products_tenant_id_tenants_id_fk"
		}),
]);

export const orders = pgTable("orders", {
	id: uuid().defaultRandom().notNull(),
	tenantId: uuid("tenant_id").notNull(),
	customerName: text("customer_name").notNull(),
	customerAddress: text("customer_address").notNull(),
	items: jsonb().notNull(),
	totalAmount: integer("total_amount").notNull(),
	status: text().default('pending').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.tenantId],
			foreignColumns: [tenants.id],
			name: "orders_tenant_id_tenants_id_fk"
		}),
]);
