ALTER TABLE `quote_requests` ADD `status` enum('new','contacted','quoted','won','lost') DEFAULT 'new' NOT NULL;--> statement-breakpoint
ALTER TABLE `quote_requests` ADD `notes` text;--> statement-breakpoint
ALTER TABLE `quote_requests` ADD `quotedAmount` varchar(50);--> statement-breakpoint
ALTER TABLE `quote_requests` ADD `updatedAt` timestamp DEFAULT (now()) NOT NULL ON UPDATE CURRENT_TIMESTAMP;