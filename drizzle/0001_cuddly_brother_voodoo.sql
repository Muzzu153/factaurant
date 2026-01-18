ALTER TABLE "orders" RENAME COLUMN "tenantId" TO "tenant_id";--> statement-breakpoint
ALTER TABLE "products" RENAME COLUMN "tenantId" TO "tenant_id";--> statement-breakpoint
ALTER TABLE "products" RENAME COLUMN "image-url" TO "image_url";--> statement-breakpoint
ALTER TABLE "orders" DROP CONSTRAINT "orders_tenantId_tenants_id_fk";
--> statement-breakpoint
ALTER TABLE "products" DROP CONSTRAINT "products_tenantId_tenants_id_fk";
--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "status" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "blocks" jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "pages" jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenants" DROP COLUMN "layout";