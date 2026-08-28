CREATE TABLE `follow_up_emails` (
	`id` int AUTO_INCREMENT NOT NULL,
	`quoteRequestId` int NOT NULL,
	`emailType` enum('day1_confirmation','day3_followup','day7_final','review_request') NOT NULL,
	`sentAt` timestamp NOT NULL DEFAULT (now()),
	`status` enum('sent','failed') NOT NULL DEFAULT 'sent',
	CONSTRAINT `follow_up_emails_id` PRIMARY KEY(`id`)
);
