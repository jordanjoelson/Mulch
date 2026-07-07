ALTER TABLE `accounts` ADD `next_payment_due_date` text;--> statement-breakpoint
ALTER TABLE `accounts` ADD `minimum_payment` real;--> statement-breakpoint
ALTER TABLE `accounts` ADD `last_statement_balance` real;