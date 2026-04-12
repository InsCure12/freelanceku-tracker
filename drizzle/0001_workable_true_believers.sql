ALTER TABLE `job` ADD `deadline` text;--> statement-breakpoint
ALTER TABLE `job` ADD `payment_status` text DEFAULT 'unpaid' NOT NULL;