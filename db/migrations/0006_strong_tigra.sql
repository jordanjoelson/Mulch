CREATE TABLE `card_tiers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`product_id` text NOT NULL,
	`tier` text NOT NULL,
	`source` text DEFAULT 'user' NOT NULL,
	`note` text,
	`updated_at` text DEFAULT (current_timestamp) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `card_tiers_product_id_unique` ON `card_tiers` (`product_id`);