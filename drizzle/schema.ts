import { pgTable, uniqueIndex, foreignKey, pgPolicy, uuid, text, timestamp, unique, jsonb, integer, boolean } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const users = pgTable("users", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	tenantId: uuid("tenant_id").notNull(),
	email: text().notNull(),
	passwordHash: text("password_hash").notNull(),
	name: text().notNull(),
	role: text().default('owner').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	uniqueIndex("tenant_email_idx").using("btree", table.tenantId.asc().nullsLast().op("text_ops"), table.email.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.tenantId],
			foreignColumns: [tenants.id],
			name: "users_tenant_id_tenants_id_fk"
		}).onDelete("cascade"),
	pgPolicy("factaurant_app_users_isolation", { as: "permissive", for: "all", to: ["factaurant_app"] }),
	pgPolicy("smoke_reader_can_read_users", { as: "permissive", for: "select", to: ["smoke_reader"] }),
]);

export const tenants = pgTable("tenants", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	slug: text().notNull(),
	name: text().notNull(),
	theme: jsonb().notNull(),
	blocks: jsonb().notNull(),
	pages: jsonb().notNull(),
}, (table) => [
	unique("tenants_slug_unique").on(table.slug),
	pgPolicy("smoke_reader_can_read_tenants", { as: "permissive", for: "select", to: ["smoke_reader"] }),
]);

export const orders = pgTable("orders", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	tenantId: uuid("tenant_id").notNull(),
	customerName: text("customer_name").notNull(),
	customerAddress: text("customer_address").notNull(),
	items: jsonb().notNull(),
	subtotalAmount: integer("subtotal_amount").notNull(),
	discountAmount: integer("discount_amount").default(0).notNull(),
	taxAmount: integer("tax_amount").default(0).notNull(),
	totalAmount: integer("total_amount").notNull(),
	status: text().default('pending').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.tenantId],
			foreignColumns: [tenants.id],
			name: "orders_tenant_id_tenants_id_fk"
		}).onDelete("cascade"),
	pgPolicy("factaurant_app_orders_isolation", { as: "permissive", for: "all", to: ["factaurant_app"] }),
	pgPolicy("smoke_reader_can_read_tenants", { as: "permissive", for: "select", to: ["smoke_reader"] }),
	pgPolicy("smoke_reader_can_read_orders", { as: "permissive", for: "select", to: ["smoke_reader"] }),
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
		}).onDelete("cascade"),
	pgPolicy("factaurant_app_products_isolation", { as: "permissive", for: "all", to: ["factaurant_app"] }),
	pgPolicy("smoke_reader_can_read_products", { as: "permissive", for: "select", to: ["smoke_reader"] }),
]);
