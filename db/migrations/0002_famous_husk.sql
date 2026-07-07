CREATE TABLE `transactions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`transaction_id` text NOT NULL,
	`account_id` text NOT NULL,
	`name` text,
	`merchant_name` text,
	`amount` real,
	`date` text,
	`category` text,
	`pending` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `transactions_transaction_id_unique` ON `transactions` (`transaction_id`);--> statement-breakpoint
ALTER TABLE `connections` ADD `transaction_cursor` text;