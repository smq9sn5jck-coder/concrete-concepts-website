CREATE TABLE `ad_spend` (
	`id` int AUTO_INCREMENT NOT NULL,
	`platform` enum('google_ads','meta_ads','other') NOT NULL,
	`campaignName` varchar(255) NOT NULL,
	`month` varchar(7) NOT NULL,
	`spend` decimal(10,2) NOT NULL,
	`impressions` int,
	`clicks` int,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ad_spend_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `digest_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`enabled` int NOT NULL DEFAULT 1,
	`recipientEmail` varchar(320) NOT NULL,
	`frequency` enum('weekly','monthly') NOT NULL DEFAULT 'weekly',
	`dayOfWeek` int NOT NULL DEFAULT 1,
	`lastSentAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `digest_settings_id` PRIMARY KEY(`id`)
);
