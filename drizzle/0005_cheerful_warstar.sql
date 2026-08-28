ALTER TABLE `quote_requests` ADD `leadSource` varchar(100);--> statement-breakpoint
ALTER TABLE `quote_requests` ADD `utmSource` varchar(255);--> statement-breakpoint
ALTER TABLE `quote_requests` ADD `utmMedium` varchar(255);--> statement-breakpoint
ALTER TABLE `quote_requests` ADD `utmCampaign` varchar(255);--> statement-breakpoint
ALTER TABLE `quote_requests` ADD `utmTerm` varchar(255);--> statement-breakpoint
ALTER TABLE `quote_requests` ADD `referrer` varchar(500);--> statement-breakpoint
ALTER TABLE `quote_requests` ADD `landingPage` varchar(500);