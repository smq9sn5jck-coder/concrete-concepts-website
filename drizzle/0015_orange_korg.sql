CREATE TABLE `job_timeline_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`quoteRequestId` int NOT NULL,
	`eventType` enum('status_change','note_added','quote_sent','scheduled','job_started','job_completed','payment_received','webhook_update') NOT NULL,
	`fromStatus` varchar(50),
	`toStatus` varchar(50),
	`description` text,
	`metadata` text,
	`source` enum('website_admin','ccg_app','system','customer') NOT NULL DEFAULT 'website_admin',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `job_timeline_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `quote_requests` ADD `statusToken` varchar(64);--> statement-breakpoint
ALTER TABLE `quote_requests` ADD `scheduledDate` timestamp;--> statement-breakpoint
ALTER TABLE `quote_requests` ADD `contactedAt` timestamp;--> statement-breakpoint
ALTER TABLE `quote_requests` ADD `completedAt` timestamp;--> statement-breakpoint
ALTER TABLE `quote_requests` ADD CONSTRAINT `quote_requests_statusToken_unique` UNIQUE(`statusToken`);