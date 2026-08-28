CREATE TABLE `quote_line_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`quoteRequestId` int NOT NULL,
	`sortOrder` int NOT NULL DEFAULT 0,
	`description` varchar(500) NOT NULL,
	`quantity` decimal(10,2) NOT NULL DEFAULT '1',
	`unit` varchar(50) NOT NULL DEFAULT 'item',
	`rate` decimal(10,2) NOT NULL DEFAULT '0',
	`amount` decimal(10,2) NOT NULL DEFAULT '0',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `quote_line_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `quote_requests` ADD `customTerms` text;--> statement-breakpoint
ALTER TABLE `quote_requests` ADD `validityDays` int DEFAULT 30;--> statement-breakpoint
ALTER TABLE `quote_requests` ADD `customNotes` text;--> statement-breakpoint
ALTER TABLE `quote_requests` ADD `gstIncluded` int DEFAULT 1;