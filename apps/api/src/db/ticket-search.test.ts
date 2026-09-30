import { readFileSync } from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { describe, expect, it } from "vitest";
import { createTestApp } from "../test/test-app.ts";

const migrationsFolder = path.join(import.meta.dirname, "migrations");

type Journal = { entries: { tag: string }[] };

function migrationTags(): string[] {
  const journal = JSON.parse(
    readFileSync(path.join(migrationsFolder, "meta/_journal.json"), "utf8"),
  ) as Journal;
  return journal.entries.map((entry) => entry.tag);
}

/** Runs the SQL of one migration file. */
function applyMigration(database: Database.Database, tag: string) {
  const sql = readFileSync(path.join(migrationsFolder, `${tag}.sql`), "utf8");
  for (const statement of sql.split("--> statement-breakpoint")) {
    const trimmed = statement.trim();
    if (trimmed.length > 0) {
      database.exec(trimmed);
    }
  }
}

describe("ticket_search", () => {
  it("is an FTS5 table of title, description and comments", () => {
    const { database } = createTestApp();

    const table = database.$client
      .prepare("select sql from sqlite_master where type = 'table' and name = 'ticket_search'")
      .get() as { sql: string } | undefined;

    expect(table?.sql).toContain("fts5");
    expect(table?.sql).toContain("tokenize = 'unicode61 remove_diacritics 2'");
    expect(table?.sql).toContain("prefix = '2 3'");
  });

  it("backfills tickets that already existed when the index was added", () => {
    const database = new Database(":memory:");
    database.pragma("foreign_keys = OFF");
    for (const tag of migrationTags()) {
      if (tag !== "0002_ticket_search") {
        applyMigration(database, tag);
      }
    }
    database
      .prepare(
        `insert into tickets (
          id, project_id, number, title, description, status, priority, requester_id, created_at, updated_at
        ) values (
          'CHK-1', 'checkout', 1, 'Backfill title', 'Backfill description', 'open', 'low', 1,
          '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'
        )`,
      )
      .run();
    database
      .prepare(
        `insert into comments (ticket_id, kind, author_user_id, body, created_at)
         values ('CHK-1', 'internal_note', 'maya-chen', 'Backfill xylophone note', '2026-01-01T00:00:00.000Z')`,
      )
      .run();

    applyMigration(database, "0002_ticket_search");

    const indexed = database
      .prepare("select title, description, comments from ticket_search where ticket_id = 'CHK-1'")
      .get() as { title: string; description: string; comments: string } | undefined;
    expect(indexed).toEqual({
      title: "Backfill title",
      description: "Backfill description",
      comments: "Backfill xylophone note",
    });
  });

  it("keeps the index in sync when a ticket is created, edited or deleted", () => {
    const { database } = createTestApp();
    const sqlite = database.$client;

    const indexed = sqlite.prepare("select count(*) as total from ticket_search").get() as {
      total: number;
    };
    const tickets = sqlite.prepare("select count(*) as total from tickets").get() as {
      total: number;
    };
    expect(indexed.total).toBe(tickets.total);

    sqlite
      .prepare("update tickets set title = ?, description = ? where id = 'CHK-104'")
      .run("Unique title quartzflute", "Unique description amberlyre");
    const edited = sqlite
      .prepare(
        `select ticket_id from ticket_search where ticket_search match '"quartzflute"* "amberlyre"*'`,
      )
      .all() as { ticket_id: string }[];
    expect(edited).toEqual([{ ticket_id: "CHK-104" }]);

    sqlite
      .prepare(
        `insert into tickets (
          id, project_id, number, title, description, status, priority, assignee_id, requester_id,
          created_at, updated_at, first_responded_at, resolved_at
        )
        select
          'CHK-9999', project_id, 9999, 'Created ticket moonharp', description, status, priority,
          assignee_id, requester_id, created_at, updated_at, first_responded_at, resolved_at
        from tickets where id = 'CHK-104'`,
      )
      .run();
    const created = sqlite
      .prepare(`select ticket_id from ticket_search where ticket_search match '"moonharp"*'`)
      .all() as { ticket_id: string }[];
    expect(created).toEqual([{ ticket_id: "CHK-9999" }]);

    sqlite.prepare("delete from tickets where id = 'CHK-9999'").run();
    const deleted = sqlite
      .prepare("select ticket_id from ticket_search where ticket_id = 'CHK-9999'")
      .get();
    expect(deleted).toBeUndefined();
  });
});
