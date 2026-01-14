CREATE TABLE `audit_logs` (
	`id` bigint AUTO_INCREMENT PRIMARY KEY,
	`user_id` int DEFAULT (NULL),
	`entity_id` int DEFAULT (NULL),
	`username_snapshot` varchar(50) NOT NULL,
	`action` varchar(50) NOT NULL,
	`ip_address` varchar(45) DEFAULT (NULL),
	`user_agent` varchar(255) DEFAULT (NULL),
	`details` text DEFAULT (NULL),
	`created_at` datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);
--> statement-breakpoint
CREATE TABLE `brands` (
	`id` int AUTO_INCREMENT PRIMARY KEY,
	`name` varchar(50) NOT NULL,
	`slug` varchar(50) NOT NULL,
	`logo_url` varchar(255) DEFAULT (NULL),
	`website` varchar(255) NOT NULL,
	`created_at` datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
	CONSTRAINT `brands_uq_slug` UNIQUE INDEX(`slug`),
	CONSTRAINT `brand_uq_name` UNIQUE INDEX(`name`)
);
--> statement-breakpoint
CREATE TABLE `categories` (
	`id` int AUTO_INCREMENT PRIMARY KEY,
	`parent_id` int DEFAULT (NULL),
	`name` varchar(50) NOT NULL,
	`slug` varchar(50) NOT NULL,
	`image_url` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`created_at` datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
	CONSTRAINT `categories_uq_name` UNIQUE INDEX(`name`),
	CONSTRAINT `categories_uq_slug` UNIQUE INDEX(`slug`)
);
--> statement-breakpoint
CREATE TABLE `medias` (
	`id` int AUTO_INCREMENT PRIMARY KEY,
	`name` varchar(255) NOT NULL,
	`file_key` varchar(255) NOT NULL,
	`type` enum('image','video','document','audio','other') NOT NULL,
	`provider` varchar(20) NOT NULL,
	`mime_type` varchar(100) NOT NULL,
	`file_size` bigint NOT NULL,
	`url` text NOT NULL,
	`metadata` json DEFAULT (NULL),
	`created_at` datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
	CONSTRAINT `medias_uq_file_key` UNIQUE INDEX(`file_key`)
);
--> statement-breakpoint
CREATE TABLE `permissions` (
	`id` int AUTO_INCREMENT PRIMARY KEY,
	`slug` varchar(50) NOT NULL,
	`description` varchar(255) DEFAULT (NULL),
	`created_at` datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
	CONSTRAINT `permissions_uq_slug` UNIQUE INDEX(`slug`)
);
--> statement-breakpoint
CREATE TABLE `portfolio_medias` (
	`id` int AUTO_INCREMENT PRIMARY KEY,
	`portfolio_id` int NOT NULL,
	`media_id` int NOT NULL,
	`is_primary` boolean NOT NULL,
	`alt_text` varchar(255) DEFAULT (NULL),
	`sort_order` int NOT NULL,
	`created_at` datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);
--> statement-breakpoint
CREATE TABLE `portfolios` (
	`id` int AUTO_INCREMENT PRIMARY KEY,
	`created_by` int DEFAULT (NULL),
	`title` varchar(150) NOT NULL,
	`slug` varchar(150) NOT NULL,
	`location` varchar(100) DEFAULT (NULL),
	`is_featured` boolean NOT NULL,
	`is_active` boolean NOT NULL,
	`description` longtext DEFAULT (NULL),
	`completion_date` date,
	`created_at` datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
	CONSTRAINT `portfolios_uq_slug` UNIQUE INDEX(`slug`),
	CONSTRAINT `portfolios_uq_title` UNIQUE INDEX(`title`)
);
--> statement-breakpoint
CREATE TABLE `product_medias` (
	`id` int AUTO_INCREMENT PRIMARY KEY,
	`product_id` int NOT NULL,
	`media_id` int NOT NULL,
	`is_primary` boolean NOT NULL,
	`alt_text` varchar(255) DEFAULT (NULL),
	`sort_order` int NOT NULL,
	`created_at` datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);
--> statement-breakpoint
CREATE TABLE `product_specifications` (
	`id` int AUTO_INCREMENT PRIMARY KEY,
	`product_id` int NOT NULL,
	`spec_key` varchar(100) NOT NULL,
	`spec_value` varchar(50) DEFAULT (NULL),
	`created_at` datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);
--> statement-breakpoint
CREATE TABLE `product_variants` (
	`id` int AUTO_INCREMENT PRIMARY KEY,
	`product_id` int NOT NULL,
	`is_active` boolean NOT NULL DEFAULT true,
	`name` varchar(100) NOT NULL,
	`sku` varchar(50) DEFAULT (NULL),
	`price_adjustment` decimal(20,2) NOT NULL DEFAULT (0),
	`stock_quantity` decimal(10,2) NOT NULL DEFAULT (0),
	`is_unlimited_stock` boolean NOT NULL DEFAULT false,
	`created_at` datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
	CONSTRAINT `product_variants_uq_sku` UNIQUE INDEX(`sku`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT PRIMARY KEY,
	`created_by` int DEFAULT (NULL),
	`brand_id` int DEFAULT (NULL),
	`category_id` int DEFAULT (NULL),
	`name` varchar(150) NOT NULL,
	`slug` varchar(150) NOT NULL,
	`is_featured` boolean NOT NULL DEFAULT false,
	`is_active` boolean NOT NULL DEFAULT false,
	`description` longtext DEFAULT (NULL),
	`base_price` decimal(20,2) NOT NULL DEFAULT (0),
	`show_price` boolean NOT NULL DEFAULT true,
	`created_at` datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
	CONSTRAINT `products_uq_name` UNIQUE INDEX(`name`),
	CONSTRAINT `products_uq_slug` UNIQUE INDEX(`slug`)
);
--> statement-breakpoint
CREATE TABLE `roles` (
	`id` int AUTO_INCREMENT PRIMARY KEY,
	`name` varchar(50) NOT NULL,
	`description` varchar(255) DEFAULT (NULL),
	`created_at` datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
	CONSTRAINT `roles_uq_name` UNIQUE INDEX(`name`)
);
--> statement-breakpoint
CREATE TABLE `roles_permissions` (
	`roles_id` int NOT NULL,
	`permissions_id` int NOT NULL,
	`granted_at` datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
	CONSTRAINT `PRIMARY` PRIMARY KEY(`roles_id`,`permissions_id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT PRIMARY KEY,
	`is_active` boolean NOT NULL DEFAULT true,
	`username` varchar(50) NOT NULL,
	`email` varchar(100) NOT NULL,
	`password_hash` varchar(255) NOT NULL,
	`last_login` datetime NOT NULL,
	`created_at` datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
	CONSTRAINT `users_uq_email` UNIQUE INDEX(`email`),
	CONSTRAINT `users_uq_username` UNIQUE INDEX(`username`)
);
--> statement-breakpoint
CREATE TABLE `users_roles` (
	`users_id` int NOT NULL,
	`roles_id` int NOT NULL,
	`assigned_at` datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
	CONSTRAINT `PRIMARY` PRIMARY KEY(`users_id`,`roles_id`)
);
--> statement-breakpoint
ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_users` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;--> statement-breakpoint
ALTER TABLE `categories` ADD CONSTRAINT `categories_parent_categories` FOREIGN KEY (`parent_id`) REFERENCES `categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;--> statement-breakpoint
ALTER TABLE `portfolio_medias` ADD CONSTRAINT `portfolio_images_portfolios` FOREIGN KEY (`portfolio_id`) REFERENCES `portfolios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;--> statement-breakpoint
ALTER TABLE `portfolio_medias` ADD CONSTRAINT `portfolio_medias_medias` FOREIGN KEY (`media_id`) REFERENCES `medias`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;--> statement-breakpoint
ALTER TABLE `portfolios` ADD CONSTRAINT `portfolios_users` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;--> statement-breakpoint
ALTER TABLE `product_medias` ADD CONSTRAINT `product_images_products` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;--> statement-breakpoint
ALTER TABLE `product_medias` ADD CONSTRAINT `product_medias_medias` FOREIGN KEY (`media_id`) REFERENCES `medias`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;--> statement-breakpoint
ALTER TABLE `product_specifications` ADD CONSTRAINT `product_specifications_products` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;--> statement-breakpoint
ALTER TABLE `product_variants` ADD CONSTRAINT `product_variants_products` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;--> statement-breakpoint
ALTER TABLE `products` ADD CONSTRAINT `products_brands` FOREIGN KEY (`brand_id`) REFERENCES `brands`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;--> statement-breakpoint
ALTER TABLE `products` ADD CONSTRAINT `products_categories` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;--> statement-breakpoint
ALTER TABLE `products` ADD CONSTRAINT `products_users` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;--> statement-breakpoint
ALTER TABLE `roles_permissions` ADD CONSTRAINT `roles_permissions_permissions` FOREIGN KEY (`permissions_id`) REFERENCES `permissions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;--> statement-breakpoint
ALTER TABLE `roles_permissions` ADD CONSTRAINT `roles_permissions_roles` FOREIGN KEY (`roles_id`) REFERENCES `roles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;--> statement-breakpoint
ALTER TABLE `users_roles` ADD CONSTRAINT `roles_users_roles` FOREIGN KEY (`roles_id`) REFERENCES `roles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;--> statement-breakpoint
ALTER TABLE `users_roles` ADD CONSTRAINT `users_users_roles` FOREIGN KEY (`users_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;