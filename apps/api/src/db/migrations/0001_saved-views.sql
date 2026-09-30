CREATE TABLE `saved_views` (
	`id` integer PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`owner_id` text NOT NULL,
	`name` text NOT NULL,
	`filters` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `saved_views_owner_idx` ON `saved_views` (`project_id`,`owner_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `saved_views_owner_name_unique` ON `saved_views` (`project_id`,`owner_id`,`name`);