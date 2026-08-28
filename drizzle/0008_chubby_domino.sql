ALTER TABLE `quote_requests` ADD `pdfUrl` text;--> statement-breakpoint
ALTER TABLE `quote_requests` ADD `pdfRef` varchar(50);--> statement-breakpoint
ALTER TABLE `quote_requests` ADD `pdfSentAt` timestamp;