-- Created by Redgate Data Modeler (https://datamodeler.redgate-platform.com)
-- Last modification date: 2026-01-10 15:14:33.119

-- tables
-- Table: audit_logs
CREATE TABLE `audit_logs` (
    `id` bigint  NOT NULL AUTO_INCREMENT COMMENT 'unique primary identifier.',
    `user_id` int  NULL COMMENT 'The user who performed the action.',
    `entity_id` int  NULL COMMENT 'ID of the affected record (e.g., the Product ID).',
    `username_snapshot` varchar(50)  NOT NULL COMMENT 'Captures the username at the time of action (in case user is deleted).',
    `action` varchar(50)  NOT NULL COMMENT 'Verb describing the event (e.g., "LOGIN", "UPDATE_PRODUCT").',
    `ip_address` varchar(45)  NULL COMMENT 'Network origin of the request.',
    `user_agent` varchar(255)  NULL COMMENT 'The platform it uses for the action',
    `details` text  NULL COMMENT 'JSON or text blob containing the "before" and "after" state of the data.',
    `created_at` datetime  NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Standard audit timestamps.',
    CONSTRAINT `audit_logs_pk` PRIMARY KEY (`id`)
) COMMENT 'Immutable record of sensitive actions taken within the system for security and troubleshooting.';

-- Table: brands
CREATE TABLE `brands` (
    `id` int  NOT NULL AUTO_INCREMENT COMMENT 'unique primary identifier.',
    `name` varchar(50)  NOT NULL COMMENT 'Official name of the manufacturer or brand',
    `slug` varchar(50)  NOT NULL COMMENT 'URL-friendly unique identifier.',
    `logo_url` varchar(255)  NULL COMMENT 'Absolute path to the logo''''s image (Storage or Public).',
    `website` varchar(255)  NOT NULL COMMENT 'The official manufacturers'''' or brands'''' website',
    `created_at` datetime  NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Standard audit timestamps.',
    `updated_at` datetime  NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Standard audit timestamps.',
    UNIQUE INDEX `brand_uq_name` (`name`),
    UNIQUE INDEX `brands_uq_slug` (`slug`),
    CONSTRAINT `brands_pk` PRIMARY KEY (`id`)
) COMMENT 'Manufacturers or brands of the products.';

-- Table: categories
CREATE TABLE `categories` (
    `id` int  NOT NULL AUTO_INCREMENT COMMENT 'unique primary identifier.',
    `parent_id` int  NULL COMMENT 'Self-reference to allow nested sub-categories.',
    `name` varchar(50)  NOT NULL COMMENT 'Diffrentieable name of the Category',
    `slug` varchar(50)  NOT NULL COMMENT 'URL-friendly unique identifier.',
    `image_url` varchar(255)  NOT NULL COMMENT 'Absolute path to the category''''s thumbnail image (Storage or Public).',
    `description` text  NOT NULL COMMENT 'Detailed Descriptiton of the category',
    `created_at` datetime  NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Standard audit timestamps.',
    `updated_at` datetime  NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Standard audit timestamps.',
    UNIQUE INDEX `categories_uq_name` (`name`),
    UNIQUE INDEX `categories_uq_slug` (`slug`),
    CONSTRAINT `categories_pk` PRIMARY KEY (`id`)
) COMMENT 'Hierarchical taxonomy for products.';

-- Table: medias
CREATE TABLE `medias` (
    `id` int  NOT NULL AUTO_INCREMENT COMMENT 'unique primary identifier.',
    `name` varchar(255)  NOT NULL COMMENT 'Original filename or a user-defined title.',
    `file_key` varchar(255)  NOT NULL COMMENT 'Unique identifier (e.g., the local filename or S3 key).',
    `type` enum("image", "video", "document", "audio", "other")  NOT NULL COMMENT 'image, video, document, audio, other.',
    `provider` varchar(20)  NOT NULL COMMENT 'local, mux, cloudinary, etc.',
    `mime_type` varchar(100)  NOT NULL COMMENT 'application/pdf, image/webp, video/mp4, etc.',
    `file_size` bigint  NOT NULL COMMENT 'Size in bytes for tracking storage usage.',
    `url` text  NOT NULL COMMENT 'Publicly accessible URL.',
    `metadata` json  NULL COMMENT 'Stores type-specific data.',
    `created_at` datetime  NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Standard audit timestamps.',
    `updated_at` datetime  NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Standard audit timestamps.',
    UNIQUE INDEX `medias_uq_file_key` (`file_key`),
    CONSTRAINT `portfolio_images_pk` PRIMARY KEY (`id`)
) COMMENT 'This is the central repository for all assets. It separates the "physical" asset info from where it is used.';

-- Table: permissions
CREATE TABLE `permissions` (
    `id` int  NOT NULL AUTO_INCREMENT COMMENT 'unique primary identifier.',
    `slug` varchar(50)  NOT NULL COMMENT 'Unique machine-readable string for code-level checks (e.g., im:product:write).',
    `description` varchar(255)  NULL COMMENT 'Context for what the specific permission allows.',
    `created_at` datetime  NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Standard audit timestamps.',
    `updated_at` datetime  NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Standard audit timestamps.',
    UNIQUE INDEX `permissions_uq_slug` (`slug`),
    CONSTRAINT `permissions_pk` PRIMARY KEY (`id`)
);

-- Table: portfolio_medias
CREATE TABLE `portfolio_medias` (
    `id` int  NOT NULL AUTO_INCREMENT COMMENT 'unique primary identifier.',
    `portfolio_id` int  NOT NULL COMMENT 'Reference to the portfolio that have the image.',
    `media_id` int  NOT NULL COMMENT 'Reference to the media',
    `is_primary` boolean  NOT NULL COMMENT 'If true, this is the main image used in thumbnails.',
    `alt_text` varchar(255)  NULL COMMENT 'Image''''s alt text',
    `sort_order` int  NOT NULL COMMENT 'Controls the sequence in the image gallery.',
    `created_at` datetime  NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Standard audit timestamps.',
    `updated_at` datetime  NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Standard audit timestamps.',
    CONSTRAINT `portfolio_images_pk` PRIMARY KEY (`id`)
) COMMENT 'Visual assets associated with a portofolio.';

-- Table: portfolios
CREATE TABLE `portfolios` (
    `id` int  NOT NULL AUTO_INCREMENT COMMENT 'unique primary identifier.',
    `created_by` int  NULL COMMENT 'Reference to the user who documented the project.',
    `title` varchar(150)  NOT NULL COMMENT 'Name of the project.',
    `slug` varchar(150)  NOT NULL COMMENT 'URL-friendly unique identifier.',
    `location` varchar(100)  NULL COMMENT 'Physical area where the project was completed (e.g., "Jakarta").',
    `is_featured` boolean  NOT NULL COMMENT 'Controls visibility in the "Featured Projects" section.',
    `is_active` boolean  NOT NULL COMMENT 'Controls visibility on the public frontend.',
    `description` longtext  NULL COMMENT 'Detailed documentation text (HTML/Markdown supported).',
    `completion_date` date  NULL COMMENT 'The date the project was finalized.',
    `created_at` datetime  NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Standard audit timestamps.',
    `updated_at` datetime  NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Standard audit timestamps.',
    UNIQUE INDEX `portfolios_uq_title` (`title`),
    UNIQUE INDEX `portfolios_uq_slug` (`slug`),
    CONSTRAINT `portfolios_pk` PRIMARY KEY (`id`)
) COMMENT 'Records of completed projects, court installations, or case studies.';

-- Table: product_medias
CREATE TABLE `product_medias` (
    `id` int  NOT NULL AUTO_INCREMENT COMMENT 'unique primary identifier.',
    `product_id` int  NOT NULL COMMENT 'Reference to the product that have the image.',
    `media_id` int  NOT NULL COMMENT 'Reference to the media',
    `is_primary` boolean  NOT NULL COMMENT 'If true, this is the main image used in thumbnails.',
    `alt_text` varchar(255)  NULL COMMENT 'Image''''s alt text',
    `sort_order` int  NOT NULL COMMENT 'Controls the sequence in the image gallery.',
    `created_at` datetime  NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Standard audit timestamps.',
    `updated_at` datetime  NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Standard audit timestamps.',
    CONSTRAINT `product_images_pk` PRIMARY KEY (`id`)
) COMMENT 'Visual assets associated with a product.';

-- Table: product_specifications
CREATE TABLE `product_specifications` (
    `id` int  NOT NULL AUTO_INCREMENT COMMENT 'unique primary identifier.',
    `product_id` int  NOT NULL COMMENT 'Reference to the product that have the image.',
    `spec_key` varchar(100)  NOT NULL COMMENT 'Specification''''s key',
    `spec_value` varchar(50)  NULL COMMENT 'Specification''''s value',
    `created_at` datetime  NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Standard audit timestamps.',
    `updated_at` datetime  NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Standard audit timestamps.',
    CONSTRAINT `product_specifications_pk` PRIMARY KEY (`id`)
) COMMENT 'Flexible key-value pairs for technical data (e.g., "Weight": "10kg").';

-- Table: product_variants
CREATE TABLE `product_variants` (
    `id` int  NOT NULL AUTO_INCREMENT COMMENT 'unique primary identifier.',
    `product_id` int  NOT NULL COMMENT 'Reference to the product that have the variant.',
    `is_active` boolean  NOT NULL DEFAULT TRUE COMMENT 'Controls visibility on the public frontend.',
    `name` varchar(100)  NOT NULL COMMENT 'Commercial name of the variant.',
    `sku` varchar(50)  NULL COMMENT 'Stock Keeping Unit (Unique barcode/identifier)',
    `price_adjustment` decimal(20,2)  NOT NULL DEFAULT 0.00 COMMENT 'Amount added to or subtracted from the product''''s base price.',
    `stock_quantity` decimal(20,2)  NOT NULL DEFAULT 0 COMMENT 'Current inventory level.',
    `is_unlimited_stock` boolean  NOT NULL DEFAULT FALSE COMMENT 'Flag for items that don''''t track physical inventory counts.',
    `created_at` datetime  NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Standard audit timestamps.',
    `updated_at` datetime  NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Standard audit timestamps.',
    CONSTRAINT `product_variants_pk` PRIMARY KEY (`id`)
) COMMENT 'Specific versions of a product (e.g., different sizes or materials).';

-- Table: products
CREATE TABLE `products` (
    `id` int  NOT NULL AUTO_INCREMENT COMMENT 'unique primary identifier.',
    `created_by` int  NULL COMMENT 'Reference to the user who added the product.',
    `brand_id` int  NULL COMMENT 'Foreign keys for organization.',
    `category_id` int  NULL COMMENT 'Foreign keys for organization.',
    `name` varchar(150)  NOT NULL COMMENT 'Commercial name of the product.',
    `slug` varchar(150)  NOT NULL COMMENT 'URL-friendly unique identifier.',
    `is_featured` boolean  NOT NULL DEFAULT FALSE COMMENT 'If true, the item appears in homepage highlights.',
    `is_active` boolean  NOT NULL DEFAULT FALSE COMMENT 'Controls visibility on the public frontend.',
    `description` longtext  NULL COMMENT 'Detailed marketing text (HTML/Markdown supported).',
    `base_price` decimal(20,2)  NOT NULL DEFAULT 0.00 COMMENT 'Starting price before variant adjustments.',
    `show_price` boolean  NOT NULL DEFAULT TRUE COMMENT 'Controls price''''s visibility on the public frontend.',
    `created_at` datetime  NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Standard audit timestamps.',
    `updated_at` datetime  NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Standard audit timestamps.',
    UNIQUE INDEX `products_uq_name` (`name`),
    UNIQUE INDEX `products_uq_slug` (`slug`),
    CONSTRAINT `products_pk` PRIMARY KEY (`id`)
) COMMENT 'The core catalog entity representing a saleable or displayable item.';

-- Table: roles
CREATE TABLE `roles` (
    `id` int  NOT NULL AUTO_INCREMENT COMMENT 'unique primary identifier.',
    `name` varchar(50)  NOT NULL COMMENT 'Human-readable name of the role.',
    `description` varchar(255)  NULL COMMENT 'Explanation of what users with this role can do.',
    `created_at` datetime  NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Standard audit timestamps.',
    `updated_at` datetime  NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Standard audit timestamps.',
    UNIQUE INDEX `roles_uq_name` (`name`),
    CONSTRAINT `roles_pk` PRIMARY KEY (`id`)
) COMMENT 'Defines groups of permissions (e.g., Admin, Editor, Viewer).';

-- Table: roles_permissions
CREATE TABLE `roles_permissions` (
    `roles_id` int  NOT NULL COMMENT 'unique primary identifier.',
    `permissions_id` int  NOT NULL COMMENT 'unique primary identifier.',
    `granted_at` datetime  NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Standard audit timestamps.',
    CONSTRAINT `roles_permissions_pk` PRIMARY KEY (`roles_id`,`permissions_id`)
) COMMENT 'Bridge tables between roles and permissions (Many-to-Many).';

-- Table: users
CREATE TABLE `users` (
    `id` int  NOT NULL AUTO_INCREMENT COMMENT 'unique primary identifier.',
    `is_active` boolean  NOT NULL DEFAULT TRUE COMMENT 'Flag to enable or suspend account access.',
    `username` varchar(50)  NOT NULL COMMENT 'Unique login name.',
    `email` varchar(100)  NOT NULL COMMENT 'Primary contact and unique identifier for communication.',
    `password_hash` varchar(255)  NOT NULL COMMENT 'Securely salted and hashed password string.',
    `last_login` datetime  NOT NULL COMMENT 'Timestamp of the most recent successful authentication.',
    `created_at` datetime  NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Standard audit timestamps.',
    `updated_at` datetime  NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Standard audit timestamps.',
    UNIQUE INDEX `users_uq_username` (`username`),
    UNIQUE INDEX `users_uq_email` (`email`),
    CONSTRAINT `users_pk` PRIMARY KEY (`id`)
) COMMENT 'Stores user credentials and account status for administrative access to the system.';

-- Table: users_roles
CREATE TABLE `users_roles` (
    `users_id` int  NOT NULL COMMENT 'unique primary identifier.',
    `roles_id` int  NOT NULL COMMENT 'unique primary identifier.',
    `assigned_at` datetime  NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Standard audit timestamps.',
    CONSTRAINT `users_roles_pk` PRIMARY KEY (`users_id`,`roles_id`)
) COMMENT 'Bridge tables between users and roles (Many-to-Many).';

-- foreign keys
-- Reference: audit_logs_users (table: audit_logs)
ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_users` FOREIGN KEY `audit_logs_users` (`user_id`)
    REFERENCES `users` (`id`);

-- Reference: categories_parent_categories (table: categories)
ALTER TABLE `categories` ADD CONSTRAINT `categories_parent_categories` FOREIGN KEY `categories_parent_categories` (`parent_id`)
    REFERENCES `categories` (`id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE;

-- Reference: portfolio_images_portfolios (table: portfolio_medias)
ALTER TABLE `portfolio_medias` ADD CONSTRAINT `portfolio_images_portfolios` FOREIGN KEY `portfolio_images_portfolios` (`portfolio_id`)
    REFERENCES `portfolios` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE;

-- Reference: portfolio_medias_medias (table: portfolio_medias)
ALTER TABLE `portfolio_medias` ADD CONSTRAINT `portfolio_medias_medias` FOREIGN KEY `portfolio_medias_medias` (`media_id`)
    REFERENCES `medias` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE;

-- Reference: portfolios_users (table: portfolios)
ALTER TABLE `portfolios` ADD CONSTRAINT `portfolios_users` FOREIGN KEY `portfolios_users` (`created_by`)
    REFERENCES `users` (`id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE;

-- Reference: product_images_products (table: product_medias)
ALTER TABLE `product_medias` ADD CONSTRAINT `product_images_products` FOREIGN KEY `product_images_products` (`product_id`)
    REFERENCES `products` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE;

-- Reference: product_medias_medias (table: product_medias)
ALTER TABLE `product_medias` ADD CONSTRAINT `product_medias_medias` FOREIGN KEY `product_medias_medias` (`media_id`)
    REFERENCES `medias` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE;

-- Reference: product_specifications_products (table: product_specifications)
ALTER TABLE `product_specifications` ADD CONSTRAINT `product_specifications_products` FOREIGN KEY `product_specifications_products` (`product_id`)
    REFERENCES `products` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE;

-- Reference: product_variants_products (table: product_variants)
ALTER TABLE `product_variants` ADD CONSTRAINT `product_variants_products` FOREIGN KEY `product_variants_products` (`product_id`)
    REFERENCES `products` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE;

-- Reference: products_brands (table: products)
ALTER TABLE `products` ADD CONSTRAINT `products_brands` FOREIGN KEY `products_brands` (`brand_id`)
    REFERENCES `brands` (`id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE;

-- Reference: products_categories (table: products)
ALTER TABLE `products` ADD CONSTRAINT `products_categories` FOREIGN KEY `products_categories` (`category_id`)
    REFERENCES `categories` (`id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE;

-- Reference: products_users (table: products)
ALTER TABLE `products` ADD CONSTRAINT `products_users` FOREIGN KEY `products_users` (`created_by`)
    REFERENCES `users` (`id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE;

-- Reference: roles_permissions_permissions (table: roles_permissions)
ALTER TABLE `roles_permissions` ADD CONSTRAINT `roles_permissions_permissions` FOREIGN KEY `roles_permissions_permissions` (`permissions_id`)
    REFERENCES `permissions` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE;

-- Reference: roles_permissions_roles (table: roles_permissions)
ALTER TABLE `roles_permissions` ADD CONSTRAINT `roles_permissions_roles` FOREIGN KEY `roles_permissions_roles` (`roles_id`)
    REFERENCES `roles` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE;

-- Reference: roles_users_roles (table: users_roles)
ALTER TABLE `users_roles` ADD CONSTRAINT `roles_users_roles` FOREIGN KEY `roles_users_roles` (`roles_id`)
    REFERENCES `roles` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE;

-- Reference: users_users_roles (table: users_roles)
ALTER TABLE `users_roles` ADD CONSTRAINT `users_users_roles` FOREIGN KEY `users_users_roles` (`users_id`)
    REFERENCES `users` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE;

-- End of file.

