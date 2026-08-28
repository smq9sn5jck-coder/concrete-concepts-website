CREATE TABLE `social_posts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`caption` text NOT NULL,
	`imageUrl` text,
	`platforms` varchar(100) NOT NULL DEFAULT 'facebook,instagram',
	`status` enum('draft','scheduled','publishing','published','failed') NOT NULL DEFAULT 'draft',
	`scheduledAt` timestamp,
	`publishedAt` timestamp,
	`fbPostId` varchar(255),
	`igPostId` varchar(255),
	`errorMessage` text,
	`postType` enum('blog_share','project_photo','testimonial','promotion','custom') NOT NULL DEFAULT 'custom',
	`blogPostId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `social_posts_id` PRIMARY KEY(`id`)
);
