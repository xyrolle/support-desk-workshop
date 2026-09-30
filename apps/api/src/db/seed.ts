import type { AppDatabase } from "./client.ts";
import { inTransaction } from "./client.ts";
import {
  comments,
  contacts,
  labels,
  organizations,
  projectMembers,
  projects,
  ticketEvents,
  ticketLabels,
  tickets,
  users,
} from "./schema.ts";
import { seedDataFor } from "./seed/seed-date.ts";

export type SeedSummary = {
  users: number;
  organizations: number;
  tickets: number;
  comments: number;
};

/** SQLite limits the number of values in one statement, so large inserts go in batches. */
const ROWS_PER_INSERT = 500;

/**
 * Replaces all data with the demo data as of `now`. Every copy gets the same tickets
 * and ids whatever day it runs (see `SEED_DATE`); tests seed at `SEED_DATE` itself.
 */
export function seedDatabase(database: AppDatabase, now = new Date()): SeedSummary {
  const data = seedDataFor(now);

  inTransaction(database, () => {
    for (const table of [
      ticketEvents,
      comments,
      ticketLabels,
      tickets,
      labels,
      contacts,
      organizations,
      projectMembers,
      projects,
      users,
    ]) {
      database.delete(table).run();
    }

    insertInBatches(database, users, data.users);
    insertInBatches(database, projects, data.projects);
    insertInBatches(database, projectMembers, data.projectMembers);
    insertInBatches(database, organizations, data.organizations);
    insertInBatches(database, contacts, data.contacts);
    insertInBatches(database, labels, data.labels);
    insertInBatches(database, tickets, data.tickets);
    insertInBatches(database, ticketLabels, data.ticketLabels);
    insertInBatches(database, comments, data.comments);
    insertInBatches(database, ticketEvents, data.ticketEvents);
  });

  return {
    users: data.users.length,
    organizations: data.organizations.length,
    tickets: data.tickets.length,
    comments: data.comments.length,
  };
}

export function isDatabaseEmpty(database: AppDatabase): boolean {
  const anyUser = database.select({ id: users.id }).from(users).limit(1).get();
  return anyUser === undefined;
}

type SeedTable =
  | typeof users
  | typeof projects
  | typeof projectMembers
  | typeof organizations
  | typeof contacts
  | typeof labels
  | typeof tickets
  | typeof ticketLabels
  | typeof comments
  | typeof ticketEvents;

function insertInBatches<Table extends SeedTable>(
  database: AppDatabase,
  table: Table,
  rows: Table["$inferInsert"][],
): void {
  for (let start = 0; start < rows.length; start += ROWS_PER_INSERT) {
    database
      .insert(table)
      .values(rows.slice(start, start + ROWS_PER_INSERT))
      .run();
  }
}
