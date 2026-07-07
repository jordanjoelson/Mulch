CREATE TABLE `accounts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`connection_id` integer NOT NULL,
	`account_id` text NOT NULL,
	`name` text,
	`official_name` text,
	`type` text,
	`subtype` text,
	`mask` text,
	`current_balance` real,
	`available_balance` real,
	`credit_limit` real,
	`updated_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`connection_id`) REFERENCES `connections`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `accounts_account_id_unique` ON `accounts` (`account_id`);