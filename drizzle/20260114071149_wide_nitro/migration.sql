ALTER TABLE `categories` MODIFY COLUMN `image_url` varchar(255) DEFAULT (NULL);--> statement-breakpoint
ALTER TABLE `categories` MODIFY COLUMN `description` text DEFAULT (NULL);