CREATE TABLE `quote_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`phone` varchar(50) NOT NULL,
	`email` varchar(320) NOT NULL,
	`suburb` varchar(255) NOT NULL,
	`service` varchar(255) NOT NULL,
	`details` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `quote_requests_id` PRIMARY KEY(`id`)
);
