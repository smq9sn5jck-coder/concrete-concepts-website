ALTER TABLE `callback_requests` ADD `utmSource` varchar(255);--> statement-breakpoint
ALTER TABLE `callback_requests` ADD `utmMedium` varchar(255);--> statement-breakpoint
ALTER TABLE `callback_requests` ADD `utmCampaign` varchar(255);--> statement-breakpoint
ALTER TABLE `callback_requests` ADD `utmTerm` varchar(255);--> statement-breakpoint
ALTER TABLE `callback_requests` ADD `utmContent` varchar(255);--> statement-breakpoint
ALTER TABLE `callback_requests` ADD `gclid` varchar(255);--> statement-breakpoint
ALTER TABLE `callback_requests` ADD `fbclid` varchar(255);--> statement-breakpoint
ALTER TABLE `callback_requests` ADD `referrer` varchar(500);--> statement-breakpoint
ALTER TABLE `callback_requests` ADD `landingPage` varchar(500);--> statement-breakpoint
ALTER TABLE `quote_requests` ADD `utmContent` varchar(255);--> statement-breakpoint
ALTER TABLE `quote_requests` ADD `gclid` varchar(255);--> statement-breakpoint
ALTER TABLE `quote_requests` ADD `fbclid` varchar(255);