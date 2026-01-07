import { timestamp, mysqlTable, mysqlSchema, AnyMySqlColumn, bigint, int, varchar, text, datetime, longtext, decimal, boolean, uniqueIndex, foreignKey, primaryKey } from "drizzle-orm/mysql-core"
import { sql } from "drizzle-orm"
import { date } from "drizzle-orm/cockroach-core";

export const auditLogs = mysqlTable("audit_logs", {
	id: bigint({ mode: 'number' }).autoincrement().primaryKey(),
	userId: int("user_id").default(sql`NULL`),
	usernameSnapshot: varchar("username_snapshot", { length: 50 }).notNull(),
	action: varchar({ length: 50 }).notNull(),
	entityId: int("entity_id").default(sql`NULL`),
	ipAddress: varchar("ip_address", { length: 45 }).default(sql`NULL`),
	userAgent: varchar("user_agent", { length: 255 }).default(sql`NULL`),
	details: text().default(sql`NULL`),
	createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
},
(table) => [
	foreignKey({
		columns: [table.userId],
		foreignColumns: [users.id],
		name: "audit_logs_users"
	}).onUpdate("cascade").onDelete("set null"),
]);

export const brands = mysqlTable("brands", {
	id: int().autoincrement().primaryKey(),
	name: varchar({ length: 50 }).notNull(),
	slug: varchar({ length: 50 }).notNull(),
	logoUrl: varchar("logo_url", { length: 255 }).default(sql`NULL`),
	website: varchar({ length: 255 }).notNull(),
	createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
},
(table) => [
	uniqueIndex("brands_uq_name").on(table.name),
	uniqueIndex("brands_uq_slug").on(table.slug),
]);

export const categories = mysqlTable("categories", {
	id: int().autoincrement().primaryKey(),
	name: varchar({ length: 50 }).notNull(),
	slug: varchar({ length: 50 }).notNull(),
	description: text().notNull(),
	parentId: int("parent_id").default(sql`NULL`),
	imageUrl: varchar("image_url", { length: 255 }).notNull(),
	createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
},
(table) => [
	uniqueIndex("categories_uq_slug").on(table.slug),
	foreignKey({
		columns: [table.parentId],
		foreignColumns: [table.id],
		name: "categories_categories"
	}).onUpdate("cascade").onDelete("set null"),
]);

export const permissions = mysqlTable("permissions", {
	id: int().autoincrement().primaryKey(),
	slug: varchar({ length: 50 }).notNull(),
	description: varchar({ length: 255 }).default(sql`NULL`),
	createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
},
(table) => [
	uniqueIndex("permissions_uq_slug").on(table.slug),
]);

export const products = mysqlTable("products", {
	id: int().autoincrement().primaryKey(),
	brandId: int("brand_id").default(sql`NULL`),
	categoryId: int("category_id").default(sql`NULL`),
	name: varchar({ length: 150 }).notNull(),
	slug: varchar({ length: 150 }).notNull(),
	description: longtext().default(sql`NULL`),
	basePrice: decimal("base_price", { precision: 10, scale: 2 }).notNull(),
	isActive: boolean("is_active").default(false).notNull(),
	isFeatured: boolean("is_featured").default(false).notNull(),
	createdBy: int("created_by").default(sql`NULL`),
	createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: datetime("updated_at").default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`).notNull()
},
(table) => [
	uniqueIndex("products_uq_slug").on(table.slug),
	foreignKey({
		columns: [table.brandId],
		foreignColumns: [brands.id],
		name: "products_brands"
	}).onUpdate("cascade").onDelete("set null"),
	foreignKey({
		columns: [table.categoryId],
		foreignColumns: [categories.id],
		name: "products_categories"
	}).onUpdate("cascade").onDelete("set null"),
	foreignKey({
		columns: [table.createdBy],
		foreignColumns: [users.id],
		name: "products_users"
	}).onUpdate("cascade").onDelete("set null"),
]);

export const productImages = mysqlTable("product_images", {
	id: int().autoincrement().primaryKey(),
	productId: int("product_id").notNull(),
	imageUrl: varchar("image_url", { length: 255 }).notNull(),
	altText: varchar("alt_text", { length: 150 }).default(sql`NULL`),
	isPrimary: boolean("is_primary").default(false).notNull(),
	sortOrder: int("sort_order").default(0).notNull(),
},
(table) => [
	foreignKey({
		columns: [table.productId],
		foreignColumns: [products.id],
		name: "product_images_products"
	}).onUpdate("cascade").onDelete("cascade"),
]);

export const productSpecifications = mysqlTable("product_specifications", {
	id: int().autoincrement().primaryKey(),
	productId: int("product_id").notNull(),
	specKey: varchar("spec_key", { length: 100 }).notNull(),
	specValue: varchar("spec_value", { length: 50 }).default(sql`NULL`),
},
(table) => [
	foreignKey({
		columns: [table.productId],
		foreignColumns: [products.id],
		name: "product_specifications_products"
	}).onUpdate("cascade").onDelete("cascade"),
]);

export const productVariants = mysqlTable("product_variants", {
	id: int().autoincrement().primaryKey(),
	productId: int("product_id").notNull(),
	name: varchar({ length: 100 }).notNull(),
	sku: varchar({ length: 50 }).default(sql`NULL`),
	priceAdjustment: decimal("price_adjustment", { precision: 10, scale: 2, mode: 'number' }).default(0.00).notNull(),
	stockQuantity: decimal("stock_quantity", { precision: 10, scale: 2, mode: 'number' }).default(0.00).notNull(),
	isUnlimitedStock: boolean("is_unlimited_stock").default(false).notNull(),
	isActive: boolean("is_active").default(true).notNull(),
},
(table) => [
	uniqueIndex("product_variants_uq_sku").on(table.sku),
	foreignKey({
		columns: [table.productId],
		foreignColumns: [products.id],
		name: "product_variants_products"
	}).onUpdate("cascade").onDelete("cascade"),
]);

export const roles = mysqlTable("roles", {
	id: int().autoincrement().primaryKey(),
	name: varchar({ length: 50 }).notNull(),
	description: varchar({ length: 255 }).default(sql`NULL`),
	createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: datetime("updated_at").default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`).notNull(),
},
(table) => [
	uniqueIndex("roles_uq_name").on(table.name),
]);

export const rolesPermissions = mysqlTable("roles_permissions", {
	rolesId: int("roles_id").notNull(),
	permissionsId: int("permissions_id").notNull(),
},
(table) => [
	primaryKey({ columns: [table.rolesId, table.permissionsId] }),
	foreignKey({
		columns: [table.permissionsId],
		foreignColumns: [permissions.id],
		name: "roles_permissions_permissions"
	}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
		columns: [table.rolesId],
		foreignColumns: [roles.id],
		name: "roles_permissions_roles"
	}).onUpdate("cascade").onDelete("cascade"),
]);

export const users = mysqlTable("users", {
	id: int().autoincrement().primaryKey(),
	username: varchar({ length: 50 }).notNull(),
	email: varchar({ length: 100 }).notNull(),
	passwordHash: varchar("password_hash", { length: 255 }).notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	lastLogin: datetime("last_login").notNull(),
	createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: datetime("updated_at").default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`).notNull(),
},
(table) => [
	uniqueIndex("users_uq_email").on(table.email),
	uniqueIndex("users_uq_username").on(table.username),
]);

export const usersRoles = mysqlTable("users_roles", {
	rolesId: int("roles_id").notNull(),
	usersId: int("users_id").notNull(),
	assignedAt: datetime("assigned_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
},
(table) => [
	primaryKey({columns: [table.rolesId, table.usersId] }),
	foreignKey({
		columns: [table.rolesId],
		foreignColumns: [roles.id],
		name: "roles_users_roles"
	}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
		columns: [table.usersId],
		foreignColumns: [users.id],
		name: "users_users_roles"
	}).onUpdate("cascade").onDelete("cascade"),
]);
