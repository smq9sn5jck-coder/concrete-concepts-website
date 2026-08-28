CREATE TABLE `blog_posts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(500) NOT NULL,
	`slug` varchar(500) NOT NULL,
	`excerpt` text NOT NULL,
	`content` text NOT NULL,
	`category` varchar(100) NOT NULL,
	`coverImage` text,
	`published` int NOT NULL DEFAULT 1,
	`authorName` varchar(255) NOT NULL DEFAULT 'Concrete Concepts Group',
	`readTimeMinutes` int NOT NULL DEFAULT 5,
	`metaTitle` varchar(500),
	`metaDescription` varchar(500),
	`publishedAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `blog_posts_id` PRIMARY KEY(`id`),
	CONSTRAINT `blog_posts_slug_unique` UNIQUE(`slug`)
);
