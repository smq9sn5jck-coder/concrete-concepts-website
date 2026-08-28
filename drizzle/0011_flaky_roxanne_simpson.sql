CREATE TABLE `abandoned_quotes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`name` varchar(255),
	`phone` varchar(50),
	`suburb` varchar(255),
	`service` varchar(255),
	`page` varchar(500),
	`followUpSent` int NOT NULL DEFAULT 0,
	`followUpSentAt` timestamp,
	`converted` int NOT NULL DEFAULT 0,
	`convertedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `abandoned_quotes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `customer_surveys` (
	`id` int AUTO_INCREMENT NOT NULL,
	`quoteRequestId` int NOT NULL,
	`customerName` varchar(255) NOT NULL,
	`customerEmail` varchar(320) NOT NULL,
	`overallRating` int,
	`qualityRating` int,
	`communicationRating` int,
	`timelinessRating` int,
	`feedback` text,
	`wouldRecommend` int,
	`googleReviewClicked` int NOT NULL DEFAULT 0,
	`status` enum('pending','sent','completed','expired') NOT NULL DEFAULT 'pending',
	`sentAt` timestamp,
	`completedAt` timestamp,
	`token` varchar(64) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `customer_surveys_id` PRIMARY KEY(`id`),
	CONSTRAINT `customer_surveys_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE TABLE `scheduled_blog_posts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`blogPostId` int NOT NULL,
	`scheduledPublishAt` timestamp NOT NULL,
	`published` int NOT NULL DEFAULT 0,
	`publishedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `scheduled_blog_posts_id` PRIMARY KEY(`id`)
);
