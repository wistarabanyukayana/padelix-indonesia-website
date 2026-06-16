import {
  bigint,
  bigserial,
  boolean,
  date,
  foreignKey,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

export const mediaType = pgEnum("media_type", [
  "image",
  "video",
  "document",
  "audio",
  "other",
]);

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    userId: integer("user_id"),
    entityId: integer("entity_id"),
    usernameSnapshot: varchar("username_snapshot", { length: 50 }).notNull(),
    action: varchar("action", { length: 50 }).notNull(),
    ipAddress: varchar("ip_address", { length: 45 }),
    userAgent: varchar("user_agent", { length: 255 }),
    details: text("details"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "audit_logs_users",
    })
      .onUpdate("cascade")
      .onDelete("set null"),
  ],
);

export const brands = pgTable(
  "brands",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 50 }).notNull(),
    slug: varchar("slug", { length: 50 }).notNull(),
    logoUrl: varchar("logo_url", { length: 255 }),
    website: varchar("website", { length: 255 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("brands_uq_slug").on(table.slug),
    uniqueIndex("brand_uq_name").on(table.name),
  ],
);

export const categories = pgTable(
  "categories",
  {
    id: serial("id").primaryKey(),
    parentId: integer("parent_id"),
    name: varchar("name", { length: 50 }).notNull(),
    slug: varchar("slug", { length: 50 }).notNull(),
    imageUrl: varchar("image_url", { length: 255 }),
    description: text("description"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("categories_uq_name").on(table.name),
    uniqueIndex("categories_uq_slug").on(table.slug),
    foreignKey({
      columns: [table.parentId],
      foreignColumns: [table.id],
      name: "categories_parent_categories",
    })
      .onUpdate("cascade")
      .onDelete("set null"),
  ],
);

// First-class folders for the media library: the single source of truth for
// folder structure (the old code derived folders from Cloudinary asset-folders
// and media paths, which drifted). Folders exist independently of their
// contents — empty folders persist until explicitly deleted.
export const mediaFolders = pgTable(
  "media_folders",
  {
    id: serial("id").primaryKey(),
    parentId: integer("parent_id"),
    name: varchar("name", { length: 255 }).notNull(),
    // Denormalized full path (e.g. "courts/padelix-wpt-standard") for fast
    // lookups and a stable unique key. Kept in sync on create/rename/move.
    path: varchar("path", { length: 1024 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("media_folders_uq_path").on(table.path),
    foreignKey({
      columns: [table.parentId],
      foreignColumns: [table.id],
      name: "media_folders_parent",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
  ],
);

export const medias = pgTable(
  "medias",
  {
    id: serial("id").primaryKey(),
    folderId: integer("folder_id"),
    name: varchar("name", { length: 255 }).notNull(),
    fileKey: varchar("file_key", { length: 255 }).notNull(),
    type: mediaType("type").notNull(),
    provider: varchar("provider", { length: 20 }).notNull(),
    mimeType: varchar("mime_type", { length: 100 }).notNull(),
    fileSize: bigint("file_size", { mode: "number" }).notNull(),
    url: text("url").notNull(),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },

  (table) => [
    uniqueIndex("medias_uq_file_key").on(table.fileKey),
    foreignKey({
      columns: [table.folderId],
      foreignColumns: [mediaFolders.id],
      name: "medias_media_folders",
    })
      .onUpdate("cascade")
      .onDelete("set null"),
  ],
);

export const permissions = pgTable(
  "permissions",
  {
    id: serial("id").primaryKey(),
    slug: varchar("slug", { length: 50 }).notNull(),
    description: varchar("description", { length: 255 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [uniqueIndex("permissions_uq_slug").on(table.slug)],
);

export const portfolios = pgTable(
  "portfolios",
  {
    id: serial("id").primaryKey(),
    createdBy: integer("created_by"),
    title: varchar("title", { length: 150 }).notNull(),
    slug: varchar("slug", { length: 150 }).notNull(),
    location: varchar("location", { length: 100 }),
    isFeatured: boolean("is_featured").notNull(),
    isActive: boolean("is_active").notNull(),
    description: text("description"),
    completionDate: date("completion_date", { mode: "date" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("portfolios_uq_slug").on(table.slug),
    uniqueIndex("portfolios_uq_title").on(table.title),
    foreignKey({
      columns: [table.createdBy],
      foreignColumns: [users.id],
      name: "portfolios_users",
    })
      .onUpdate("cascade")
      .onDelete("set null"),
  ],
);

export const portfolioMedias = pgTable(
  "portfolio_medias",
  {
    id: serial("id").primaryKey(),
    portfolioId: integer("portfolio_id").notNull(),
    mediaId: integer("media_id").notNull(),
    isPrimary: boolean("is_primary").notNull(),
    altText: varchar("alt_text", { length: 255 }),
    sortOrder: integer("sort_order").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.portfolioId],
      foreignColumns: [portfolios.id],
      name: "portfolio_images_portfolios",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
    foreignKey({
      columns: [table.mediaId],
      foreignColumns: [medias.id],
      name: "portfolio_medias_medias",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
  ],
);

export const products = pgTable(
  "products",
  {
    id: serial("id").primaryKey(),
    createdBy: integer("created_by"),
    brandId: integer("brand_id"),
    categoryId: integer("category_id"),
    name: varchar("name", { length: 150 }).notNull(),
    slug: varchar("slug", { length: 150 }).notNull(),
    isFeatured: boolean("is_featured").default(false).notNull(),
    isActive: boolean("is_active").default(false).notNull(),
    description: text("description"),
    basePrice: numeric("base_price", {
      precision: 20,
      scale: 2,
      mode: "number",
    })
      .default(0.0)
      .notNull(),
    showPrice: boolean("show_price").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("products_uq_name").on(table.name),
    uniqueIndex("products_uq_slug").on(table.slug),
    foreignKey({
      columns: [table.brandId],
      foreignColumns: [brands.id],
      name: "products_brands",
    })
      .onUpdate("cascade")
      .onDelete("set null"),
    foreignKey({
      columns: [table.categoryId],
      foreignColumns: [categories.id],
      name: "products_categories",
    })
      .onUpdate("cascade")
      .onDelete("set null"),
    foreignKey({
      columns: [table.createdBy],
      foreignColumns: [users.id],
      name: "products_users",
    })
      .onUpdate("cascade")
      .onDelete("set null"),
  ],
);

export const productMedias = pgTable(
  "product_medias",
  {
    id: serial("id").primaryKey(),
    productId: integer("product_id").notNull(),
    mediaId: integer("media_id").notNull(),
    isPrimary: boolean("is_primary").notNull(),
    altText: varchar("alt_text", { length: 255 }),
    sortOrder: integer("sort_order").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.productId],
      foreignColumns: [products.id],
      name: "product_images_products",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
    foreignKey({
      columns: [table.mediaId],
      foreignColumns: [medias.id],
      name: "product_medias_medias",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
  ],
);

export const productSpecifications = pgTable(
  "product_specifications",
  {
    id: serial("id").primaryKey(),
    productId: integer("product_id").notNull(),
    specKey: varchar("spec_key", { length: 100 }).notNull(),
    specValue: varchar("spec_value", { length: 50 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.productId],
      foreignColumns: [products.id],
      name: "product_specifications_products",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
  ],
);

export const productVariants = pgTable(
  "product_variants",
  {
    id: serial("id").primaryKey(),
    productId: integer("product_id").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    name: varchar("name", { length: 100 }).notNull(),
    sku: varchar("sku", { length: 50 }),
    priceAdjustment: numeric("price_adjustment", {
      precision: 20,
      scale: 2,
      mode: "number",
    })
      .default(0.0)
      .notNull(),
    stockQuantity: numeric("stock_quantity", {
      precision: 10,
      scale: 2,
      mode: "number",
    })
      .default(0.0)
      .notNull(),
    isUnlimitedStock: boolean("is_unlimited_stock").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("product_variants_uq_sku").on(table.sku),
    foreignKey({
      columns: [table.productId],
      foreignColumns: [products.id],
      name: "product_variants_products",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
  ],
);

export const roles = pgTable(
  "roles",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 50 }).notNull(),
    description: varchar("description", { length: 255 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [uniqueIndex("roles_uq_name").on(table.name)],
);

export const rolesPermissions = pgTable(
  "roles_permissions",
  {
    rolesId: integer("roles_id").notNull(),
    permissionsId: integer("permissions_id").notNull(),
    grantedAt: timestamp("granted_at").defaultNow().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.rolesId, table.permissionsId] }),
    foreignKey({
      columns: [table.permissionsId],
      foreignColumns: [permissions.id],
      name: "roles_permissions_permissions",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
    foreignKey({
      columns: [table.rolesId],
      foreignColumns: [roles.id],
      name: "roles_permissions_roles",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
  ],
);

export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    isActive: boolean("is_active").default(true).notNull(),
    username: varchar("username", { length: 50 }).notNull(),
    email: varchar("email", { length: 100 }).notNull(),
    passwordHash: varchar("password_hash", { length: 255 }).notNull(),
    lastLogin: timestamp("last_login").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    sessionVersion: integer("session_version").default(0).notNull(),
  },
  (table) => [
    uniqueIndex("users_uq_email").on(table.email),
    uniqueIndex("users_uq_username").on(table.username),
  ],
);

export const usersRoles = pgTable(
  "users_roles",
  {
    usersId: integer("users_id").notNull(),
    rolesId: integer("roles_id").notNull(),
    assignedAt: timestamp("assigned_at").defaultNow().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.usersId, table.rolesId] }),
    foreignKey({
      columns: [table.rolesId],
      foreignColumns: [roles.id],
      name: "roles_users_roles",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
    foreignKey({
      columns: [table.usersId],
      foreignColumns: [users.id],
      name: "users_users_roles",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
  ],
);
