CREATE TYPE "media_type" AS ENUM('image', 'video', 'document', 'audio', 'other');--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" bigserial PRIMARY KEY,
	"user_id" integer,
	"entity_id" integer,
	"username_snapshot" varchar(50) NOT NULL,
	"action" varchar(50) NOT NULL,
	"ip_address" varchar(45),
	"user_agent" varchar(255),
	"details" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "brands" (
	"id" serial PRIMARY KEY,
	"name" varchar(50) NOT NULL,
	"slug" varchar(50) NOT NULL,
	"logo_url" varchar(255),
	"website" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" serial PRIMARY KEY,
	"parent_id" integer,
	"name" varchar(50) NOT NULL,
	"slug" varchar(50) NOT NULL,
	"image_url" varchar(255),
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "medias" (
	"id" serial PRIMARY KEY,
	"name" varchar(255) NOT NULL,
	"file_key" varchar(255) NOT NULL,
	"type" "media_type" NOT NULL,
	"provider" varchar(20) NOT NULL,
	"mime_type" varchar(100) NOT NULL,
	"file_size" bigint NOT NULL,
	"url" text NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "permissions" (
	"id" serial PRIMARY KEY,
	"slug" varchar(50) NOT NULL,
	"description" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "portfolio_medias" (
	"id" serial PRIMARY KEY,
	"portfolio_id" integer NOT NULL,
	"media_id" integer NOT NULL,
	"is_primary" boolean NOT NULL,
	"alt_text" varchar(255),
	"sort_order" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "portfolios" (
	"id" serial PRIMARY KEY,
	"created_by" integer,
	"title" varchar(150) NOT NULL,
	"slug" varchar(150) NOT NULL,
	"location" varchar(100),
	"is_featured" boolean NOT NULL,
	"is_active" boolean NOT NULL,
	"description" text,
	"completion_date" date,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_medias" (
	"id" serial PRIMARY KEY,
	"product_id" integer NOT NULL,
	"media_id" integer NOT NULL,
	"is_primary" boolean NOT NULL,
	"alt_text" varchar(255),
	"sort_order" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_specifications" (
	"id" serial PRIMARY KEY,
	"product_id" integer NOT NULL,
	"spec_key" varchar(100) NOT NULL,
	"spec_value" varchar(50),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_variants" (
	"id" serial PRIMARY KEY,
	"product_id" integer NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"name" varchar(100) NOT NULL,
	"sku" varchar(50),
	"price_adjustment" numeric(20,2) DEFAULT '0' NOT NULL,
	"stock_quantity" numeric(10,2) DEFAULT '0' NOT NULL,
	"is_unlimited_stock" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY,
	"created_by" integer,
	"brand_id" integer,
	"category_id" integer,
	"name" varchar(150) NOT NULL,
	"slug" varchar(150) NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT false NOT NULL,
	"description" text,
	"base_price" numeric(20,2) DEFAULT '0' NOT NULL,
	"show_price" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" serial PRIMARY KEY,
	"name" varchar(50) NOT NULL,
	"description" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "roles_permissions" (
	"roles_id" integer,
	"permissions_id" integer,
	"granted_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "roles_permissions_pkey" PRIMARY KEY("roles_id","permissions_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY,
	"is_active" boolean DEFAULT true NOT NULL,
	"username" varchar(50) NOT NULL,
	"email" varchar(100) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"last_login" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"session_version" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users_roles" (
	"users_id" integer,
	"roles_id" integer,
	"assigned_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_roles_pkey" PRIMARY KEY("users_id","roles_id")
);
--> statement-breakpoint
CREATE UNIQUE INDEX "brands_uq_slug" ON "brands" ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "brand_uq_name" ON "brands" ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "categories_uq_name" ON "categories" ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "categories_uq_slug" ON "categories" ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "medias_uq_file_key" ON "medias" ("file_key");--> statement-breakpoint
CREATE UNIQUE INDEX "permissions_uq_slug" ON "permissions" ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "portfolios_uq_slug" ON "portfolios" ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "portfolios_uq_title" ON "portfolios" ("title");--> statement-breakpoint
CREATE UNIQUE INDEX "product_variants_uq_sku" ON "product_variants" ("sku");--> statement-breakpoint
CREATE UNIQUE INDEX "products_uq_name" ON "products" ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "products_uq_slug" ON "products" ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "roles_uq_name" ON "roles" ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "users_uq_email" ON "users" ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "users_uq_username" ON "users" ("username");--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_users" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_categories" FOREIGN KEY ("parent_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;--> statement-breakpoint
ALTER TABLE "portfolio_medias" ADD CONSTRAINT "portfolio_images_portfolios" FOREIGN KEY ("portfolio_id") REFERENCES "portfolios"("id") ON DELETE CASCADE ON UPDATE CASCADE;--> statement-breakpoint
ALTER TABLE "portfolio_medias" ADD CONSTRAINT "portfolio_medias_medias" FOREIGN KEY ("media_id") REFERENCES "medias"("id") ON DELETE CASCADE ON UPDATE CASCADE;--> statement-breakpoint
ALTER TABLE "portfolios" ADD CONSTRAINT "portfolios_users" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;--> statement-breakpoint
ALTER TABLE "product_medias" ADD CONSTRAINT "product_images_products" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;--> statement-breakpoint
ALTER TABLE "product_medias" ADD CONSTRAINT "product_medias_medias" FOREIGN KEY ("media_id") REFERENCES "medias"("id") ON DELETE CASCADE ON UPDATE CASCADE;--> statement-breakpoint
ALTER TABLE "product_specifications" ADD CONSTRAINT "product_specifications_products" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;--> statement-breakpoint
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_products" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_brands" FOREIGN KEY ("brand_id") REFERENCES "brands"("id") ON DELETE SET NULL ON UPDATE CASCADE;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_categories" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_users" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;--> statement-breakpoint
ALTER TABLE "roles_permissions" ADD CONSTRAINT "roles_permissions_permissions" FOREIGN KEY ("permissions_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;--> statement-breakpoint
ALTER TABLE "roles_permissions" ADD CONSTRAINT "roles_permissions_roles" FOREIGN KEY ("roles_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;--> statement-breakpoint
ALTER TABLE "users_roles" ADD CONSTRAINT "roles_users_roles" FOREIGN KEY ("roles_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;--> statement-breakpoint
ALTER TABLE "users_roles" ADD CONSTRAINT "users_users_roles" FOREIGN KEY ("users_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;