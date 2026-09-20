ALTER TABLE `quote_requests` ADD `submissionId` varchar(64);--> statement-breakpoint
ALTER TABLE `quote_requests` ADD CONSTRAINT `quote_requests_submissionId_unique` UNIQUE(`submissionId`);