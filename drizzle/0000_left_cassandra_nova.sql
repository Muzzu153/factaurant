-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"name" text NOT NULL,
	"role" text DEFAULT 'owner' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "tenants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"theme" jsonb NOT NULL,
	"blocks" jsonb NOT NULL,
	"pages" jsonb NOT NULL,
	CONSTRAINT "tenants_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "tenants" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"customer_name" text NOT NULL,
	"customer_address" text NOT NULL,
	"items" jsonb NOT NULL,
	"subtotal_amount" integer NOT NULL,
	"discount_amount" integer DEFAULT 0 NOT NULL,
	"tax_amount" integer DEFAULT 0 NOT NULL,
	"total_amount" integer NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "orders" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"price" integer NOT NULL,
	"image_url" text,
	"is_available" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
ALTER TABLE "products" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "tenant_email_idx" ON "users" USING btree ("tenant_id" text_ops,"email" text_ops);--> statement-breakpoint
CREATE POLICY "factaurant_app_users_isolation" ON "users" AS PERMISSIVE FOR ALL TO "factaurant_app";--> statement-breakpoint
CREATE POLICY "smoke_reader_can_read_users" ON "users" AS PERMISSIVE FOR SELECT TO "smoke_reader";--> statement-breakpoint
CREATE POLICY "smoke_reader_can_read_tenants" ON "tenants" AS PERMISSIVE FOR SELECT TO "smoke_reader";--> statement-breakpoint
CREATE POLICY "factaurant_app_orders_isolation" ON "orders" AS PERMISSIVE FOR ALL TO "factaurant_app";--> statement-breakpoint
CREATE POLICY "smoke_reader_can_read_tenants" ON "orders" AS PERMISSIVE FOR SELECT TO "smoke_reader";--> statement-breakpoint
CREATE POLICY "smoke_reader_can_read_orders" ON "orders" AS PERMISSIVE FOR SELECT TO "smoke_reader";--> statement-breakpoint
CREATE POLICY "factaurant_app_products_isolation" ON "products" AS PERMISSIVE FOR ALL TO "factaurant_app";--> statement-breakpoint
CREATE POLICY "smoke_reader_can_read_products" ON "products" AS PERMISSIVE FOR SELECT TO "smoke_reader";
*/