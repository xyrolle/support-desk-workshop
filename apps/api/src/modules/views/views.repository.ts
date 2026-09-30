import { type SavedView, ticketFiltersSchema } from "@support-desk/shared";
import { and, eq, sql } from "drizzle-orm";
import type { AppDatabase } from "../../db/client.ts";
import { type SavedViewRow, savedViews } from "../../db/schema.ts";

/** Alphabetical regardless of case, so "urgent" sorts with the U's. */
const byName = sql`${savedViews.name} collate nocase`;

export function findSavedViews(
  database: AppDatabase,
  projectId: string,
  ownerId: string,
): SavedView[] {
  return database
    .select()
    .from(savedViews)
    .where(and(eq(savedViews.projectId, projectId), eq(savedViews.ownerId, ownerId)))
    .orderBy(byName)
    .all()
    .map(toSavedView);
}

export function findSavedViewByName(
  database: AppDatabase,
  projectId: string,
  ownerId: string,
  name: string,
): SavedView | undefined {
  const row = database
    .select()
    .from(savedViews)
    .where(
      and(
        eq(savedViews.projectId, projectId),
        eq(savedViews.ownerId, ownerId),
        eq(savedViews.name, name),
      ),
    )
    .get();
  return row && toSavedView(row);
}

export function insertSavedView(
  database: AppDatabase,
  view: { projectId: string; ownerId: string; name: string; filters: string; createdAt: string },
): SavedView {
  const [inserted] = database.insert(savedViews).values(view).returning().all();
  if (!inserted) {
    throw new Error("SQLite did not return the new view.");
  }
  return toSavedView(inserted);
}

/** Parses `filters` on the way out, so a stored row is never returned unvalidated. */
function toSavedView(row: SavedViewRow): SavedView {
  return {
    id: row.id,
    name: row.name,
    filters: ticketFiltersSchema.parse(JSON.parse(row.filters)),
  };
}
