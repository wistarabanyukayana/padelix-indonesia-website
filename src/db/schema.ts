import { mysqlTable, bigint, int, varchar, text, datetime, boolean, longtext, date, decimal, uniqueIndex, foreignKey, primaryKey, mysqlEnum, json } from "drizzle-orm/mysql-core"
import { sql } from "drizzle-orm"

export const auditLogs = mysqlTable("audit_logs", {
	id: bigint("id", { mode: 'number' }).autoincrement().primaryKey(),
	userId: int("user_id").default(sql`NULL`),
	entityId: int("entity_id").default(sql`NULL`),
	usernameSnapshot: varchar("username_snapshot", { length: 50 }).notNull(),
	action: varchar("action", { length: 50 }).notNull(),
	ipAddress: varchar("ip_address", { length: 45 }).default(sql`NULL`),
	userAgent: varchar("user_agent", { length: 255 }).default(sql`NULL`),
	details: text("details").default(sql`NULL`),
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
	id: int("id").autoincrement().primaryKey(),
	name: varchar("name", { length: 50 }).notNull(),
	slug: varchar("slug", { length: 50 }).notNull(),
	logoUrl: varchar("logo_url", { length: 255 }).default(sql`NULL`),
	website: varchar("website", { length: 255 }).notNull(),
	createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: datetime("updated_at").default(sql`CURRENT_TIMESTAMP`).$onUpdate(() => sql`CURRENT_TIMESTAMP`).notNull(),
},
(table) => [
	uniqueIndex("brands_uq_slug").on(table.slug),
	uniqueIndex("brand_uq_name").on(table.name),
]);

export const categories = mysqlTable("categories", {
	id: int("id").autoincrement().primaryKey(),
	parentId: int("parent_id").default(sql`NULL`),
	name: varchar("name", { length: 50 }).notNull(),
	slug: varchar("slug", { length: 50 }).notNull(),
	imageUrl: varchar("image_url", { length: 255 }).default(sql`NULL`),
	description: text("description").default(sql`NULL`),
	createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: datetime("updated_at").default(sql`CURRENT_TIMESTAMP`).$onUpdate(() => sql`CURRENT_TIMESTAMP`).notNull(),
},
(table) => [
	uniqueIndex("categories_uq_name").on(table.name),
	uniqueIndex("categories_uq_slug").on(table.slug),
	foreignKey({
		columns: [table.parentId],
		foreignColumns: [table.id],
		name: "categories_parent_categories"
	}).onUpdate("cascade").onDelete("set null"),
]);

export const medias = mysqlTable("medias", {
	id: int("id").autoincrement().primaryKey(),
	name: varchar("name", { length: 255 }).notNull(),
	fileKey: varchar("file_key", { length: 255 }).notNull(),
	type: mysqlEnum("type", ["image", "video", "document", "audio", "other"]).notNull(),
	provider: varchar("provider", { length: 20 }).notNull(),
	mimeType: varchar("mime_type", { length: 100 }).notNull(),
	fileSize: bigint("file_size", { mode: 'number' }).notNull(),
	url: text("url").notNull(),
	metadata: json("metadata").default(sql`NULL`),
	createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: datetime("updated_at").default(sql`CURRENT_TIMESTAMP`).$onUpdate(() => sql`CURRENT_TIMESTAMP`).notNull(),
},

(table) => [
	uniqueIndex("medias_uq_file_key").on(table.fileKey),
]);

export const permissions = mysqlTable("permissions", {
	id: int("id").autoincrement().primaryKey(),
	slug: varchar("slug", { length: 50 }).notNull(),
	description: varchar("description", { length: 255 }).default(sql`NULL`),
	createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: datetime("updated_at").default(sql`CURRENT_TIMESTAMP`).$onUpdate(() => sql`CURRENT_TIMESTAMP`).notNull(),
},
(table) => [
	uniqueIndex("permissions_uq_slug").on(table.slug),
]);

export const portfolios = mysqlTable("portfolios", {
	id: int("id").autoincrement().primaryKey(),
	createdBy: int("created_by").default(sql`NULL`),
	title: varchar("title", { length: 150 }).notNull(),
	slug: varchar("slug", { length: 150 }).notNull(),
	location: varchar("location", { length: 100 }).default(sql`NULL`),
	isFeatured: boolean("is_featured").notNull(),
	isActive: boolean("is_active").notNull(),
	description: longtext("description").default(sql`NULL`),
	completionDate: date("completion_date"),
	createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: datetime("updated_at").default(sql`CURRENT_TIMESTAMP`).$onUpdate(() => sql`CURRENT_TIMESTAMP`).notNull(),
},
(table) => [
	uniqueIndex("portfolios_uq_slug").on(table.slug),
	uniqueIndex("portfolios_uq_title").on(table.title),
	foreignKey({
		columns: [table.createdBy],
		foreignColumns: [users.id],
		name: "portfolios_users"
	}).onUpdate("cascade").onDelete("set null"),
]);

export const portfolioMedias= mysqlTable("portfolio_medias", {
	id: int("id").autoincrement().primaryKey(),
	portfolioId: int("portfolio_id").notNull(),
	mediaId: int("media_id").notNull(),
	isPrimary: boolean("is_primary").notNull(),
	altText: varchar("alt_text", { length: 255 }).default(sql`NULL`),
	sortOrder: int("sort_order").notNull(),
	createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: datetime("updated_at").default(sql`CURRENT_TIMESTAMP`).$onUpdate(() => sql`CURRENT_TIMESTAMP`).notNull(),
},
(table) => [
	foreignKey({
		columns: [table.portfolioId],
		foreignColumns: [portfolios.id],
		name: "portfolio_images_portfolios"
	}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
		columns: [table.mediaId],
		foreignColumns: [medias.id],
		name: "portfolio_medias_medias"
	}).onUpdate("cascade").onDelete("cascade"),
]);

export const products = mysqlTable("products", {
	id: int("id").autoincrement().primaryKey(),
	createdBy: int("created_by").default(sql`NULL`),
	brandId: int("brand_id").default(sql`NULL`),
	categoryId: int("category_id").default(sql`NULL`),
	name: varchar("name", { length: 150 }).notNull(),
	slug: varchar("slug", { length: 150 }).notNull(),
	isFeatured: boolean("is_featured").default(false).notNull(),
	isActive: boolean("is_active").default(false).notNull(),
	description: longtext("description").default(sql`NULL`),
	basePrice: decimal("base_price", { precision: 20, scale: 2, mode: 'number' }).default(0.00).notNull(),
	showPrice: boolean("show_price").default(true).notNull(),
	createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: datetime("updated_at").default(sql`CURRENT_TIMESTAMP`).$onUpdate(() => sql`CURRENT_TIMESTAMP`).notNull(),
},
(table) => [
	uniqueIndex("products_uq_name").on(table.name),
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

export const productMedias = mysqlTable("product_medias", {
	id: int("id").autoincrement().primaryKey(),
	productId: int("product_id").notNull(),
	mediaId: int("media_id").notNull(),
	isPrimary: boolean("is_primary").notNull(),
	altText: varchar("alt_text", { length: 255 }).default(sql`NULL`),
	sortOrder: int("sort_order").notNull(),
	createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: datetime("updated_at").default(sql`CURRENT_TIMESTAMP`).$onUpdate(() => sql`CURRENT_TIMESTAMP`).notNull(),
},
(table) => [
	foreignKey({
		columns: [table.productId],
		foreignColumns: [products.id],
		name: "product_images_products"
	}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
		columns: [table.mediaId],
		foreignColumns: [medias.id],
		name: "product_medias_medias"
	}).onUpdate("cascade").onDelete("cascade"),
]);

export const productSpecifications = mysqlTable("product_specifications", {
	id: int("id").autoincrement().primaryKey(),
	productId: int("product_id").notNull(),
	specKey: varchar("spec_key", { length: 100 }).notNull(),
	specValue: varchar("spec_value", { length: 50 }).default(sql`NULL`),
	createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: datetime("updated_at").default(sql`CURRENT_TIMESTAMP`).$onUpdate(() => sql`CURRENT_TIMESTAMP`).notNull(),
},
(table) => [
	foreignKey({
		columns: [table.productId],
		foreignColumns: [products.id],
		name: "product_specifications_products"
	}).onUpdate("cascade").onDelete("cascade"),
]);

export const productVariants = mysqlTable("product_variants", {
	id: int("id").autoincrement().primaryKey(),
	productId: int("product_id").notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	name: varchar("name", { length: 100 }).notNull(),
	sku: varchar("sku", { length: 50 }).default(sql`NULL`),
	priceAdjustment: decimal("price_adjustment", { precision: 20, scale: 2, mode: 'number' }).default(0.00).notNull(),
	stockQuantity: decimal("stock_quantity", { precision: 10, scale: 2, mode: 'number' }).default(0.00).notNull(),
	isUnlimitedStock: boolean("is_unlimited_stock").default(false).notNull(),
	createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: datetime("updated_at").default(sql`CURRENT_TIMESTAMP`).$onUpdate(() => sql`CURRENT_TIMESTAMP`).notNull(),
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
	id: int("id").autoincrement().primaryKey(),
	name: varchar("name", { length: 50 }).notNull(),
	description: varchar("description", { length: 255 }).default(sql`NULL`),
	createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: datetime("updated_at").default(sql`CURRENT_TIMESTAMP`).$onUpdate(() => sql`CURRENT_TIMESTAMP`).notNull(),
},
(table) => [
	uniqueIndex("roles_uq_name").on(table.name),
]);

export const rolesPermissions = mysqlTable("roles_permissions", {
	rolesId: int("roles_id").notNull(),
	permissionsId: int("permissions_id").notNull(),
	grantedAt: datetime("granted_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
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
	id: int("id").autoincrement().primaryKey(),
	isActive: boolean("is_active").default(true).notNull(),
	username: varchar("username", { length: 50 }).notNull(),
	email: varchar("email", { length: 100 }).notNull(),
	passwordHash: varchar("password_hash", { length: 255 }).notNull(),
	lastLogin: datetime("last_login").notNull(),
	createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: datetime("updated_at").default(sql`CURRENT_TIMESTAMP`).$onUpdate(() => sql`CURRENT_TIMESTAMP`).notNull(),
},
(table) => [
	uniqueIndex("users_uq_email").on(table.email),
	uniqueIndex("users_uq_username").on(table.username),
]);

export const usersRoles = mysqlTable("users_roles", {
	usersId: int("users_id").notNull(),
	rolesId: int("roles_id").notNull(),
	assignedAt: datetime("assigned_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.usersId, table.rolesId] }),
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
