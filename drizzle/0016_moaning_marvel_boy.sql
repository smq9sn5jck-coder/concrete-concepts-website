CREATE TABLE `quote_booking_deliveries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`quoteRequestId` int NOT NULL,
	`tokenHash` varchar(64) NOT NULL,
	`status` enum('available','sending','sent','failed','uncertain') NOT NULL DEFAULT 'available',
	`expiresAt` timestamp NOT NULL,
	`requestedAt` timestamp,
	`sentAt` timestamp,
	`failedAt` timestamp,
	`attemptCount` int NOT NULL DEFAULT 0,
	`providerMessageId` varchar(128),
	`lastErrorClass` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `quote_booking_deliveries_id` PRIMARY KEY(`id`),
	CONSTRAINT `quote_booking_deliveries_quoteRequestId_unique` UNIQUE(`quoteRequestId`),
	CONSTRAINT `quote_booking_deliveries_tokenHash_unique` UNIQUE(`tokenHash`)
);
