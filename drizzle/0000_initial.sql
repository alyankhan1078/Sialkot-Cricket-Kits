CREATE TABLE IF NOT EXISTS `products` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`category` text NOT NULL,
	`price` real NOT NULL,
	`stock` text DEFAULT '0' NOT NULL,
	`right_stock` text,
	`left_stock` text,
	`image` text NOT NULL,
	`images` text,
	`description` text DEFAULT '' NOT NULL,
	`featured` integer DEFAULT false NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);

CREATE TABLE IF NOT EXISTS `categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL UNIQUE,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`active` integer DEFAULT true NOT NULL
);

CREATE TABLE IF NOT EXISTS `faqs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`question` text NOT NULL,
	`answer` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`active` integer DEFAULT true NOT NULL
);

CREATE TABLE IF NOT EXISTS `site_settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text DEFAULT '' NOT NULL,
	`label` text DEFAULT '' NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);

CREATE TABLE IF NOT EXISTS `enquiries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`type` text NOT NULL,
	`name` text NOT NULL,
	`email` text,
	`phone` text,
	`country` text,
	`message` text NOT NULL,
	`product` text,
	`extras` text,
	`read` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL
);

CREATE TABLE IF NOT EXISTS `orders` (
	`id` text PRIMARY KEY NOT NULL,
	`customer_name` text NOT NULL,
	`customer_phone` text,
	`customer_email` text,
	`country` text DEFAULT 'Pakistan' NOT NULL,
	`items` text NOT NULL,
	`total_amount` real NOT NULL,
	`status` text DEFAULT 'completed' NOT NULL,
	`payment_method` text DEFAULT 'Direct Transfer' NOT NULL,
	`notes` text DEFAULT '',
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);

CREATE TABLE IF NOT EXISTS `admin_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`expires_at` text NOT NULL
);

CREATE TABLE IF NOT EXISTS `admin_config` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
