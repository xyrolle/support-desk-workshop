CREATE VIRTUAL TABLE `ticket_search` USING fts5(
	`title`,
	`description`,
	`comments`,
	`ticket_id` UNINDEXED,
	tokenize = 'unicode61 remove_diacritics 2',
	prefix = '2 3'
);
--> statement-breakpoint
INSERT INTO `ticket_search` (`title`, `description`, `comments`, `ticket_id`)
SELECT
	`tickets`.`title`,
	`tickets`.`description`,
	coalesce((
		SELECT group_concat(`body`, char(10))
		FROM (
			SELECT `body`
			FROM `comments`
			WHERE `comments`.`ticket_id` = `tickets`.`id`
			ORDER BY `created_at`, `id`
		)
	), ''),
	`tickets`.`id`
FROM `tickets`;
--> statement-breakpoint
CREATE TRIGGER `ticket_search_insert` AFTER INSERT ON `tickets` BEGIN
	INSERT INTO `ticket_search` (`title`, `description`, `comments`, `ticket_id`)
	VALUES (new.`title`, new.`description`, '', new.`id`);
END;
--> statement-breakpoint
CREATE TRIGGER `ticket_search_update` AFTER UPDATE OF `title`, `description` ON `tickets` BEGIN
	UPDATE `ticket_search`
	SET `title` = new.`title`, `description` = new.`description`
	WHERE `ticket_id` = old.`id`;
END;
--> statement-breakpoint
CREATE TRIGGER `ticket_search_delete` AFTER DELETE ON `tickets` BEGIN
	DELETE FROM `ticket_search` WHERE `ticket_id` = old.`id`;
END;
--> statement-breakpoint
CREATE TRIGGER `ticket_search_comment` AFTER INSERT ON `comments` BEGIN
	UPDATE `ticket_search`
	SET `comments` = coalesce((
		SELECT group_concat(`body`, char(10))
		FROM (
			SELECT `body`
			FROM `comments`
			WHERE `comments`.`ticket_id` = new.`ticket_id`
			ORDER BY `created_at`, `id`
		)
	), '')
	WHERE `ticket_id` = new.`ticket_id`;
END;
