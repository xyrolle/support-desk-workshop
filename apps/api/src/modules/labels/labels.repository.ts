import type { Label } from "@support-desk/shared";
import { and, eq, inArray, sql } from "drizzle-orm";
import type { AppDatabase } from "../../db/client.ts";
import { labels, ticketLabels } from "../../db/schema.ts";

const labelColumns = { id: labels.id, name: labels.name, color: labels.color };

/** Alphabetical regardless of case, so "iOS" sorts among the I's. */
const byName = sql`${labels.name} collate nocase`;

export function findProjectLabels(database: AppDatabase, projectId: string): Label[] {
  return database
    .select(labelColumns)
    .from(labels)
    .where(eq(labels.projectId, projectId))
    .orderBy(byName)
    .all();
}

/** The labels of several tickets at once, keyed by ticket id and sorted by name. */
export function findLabelsOfTickets(
  database: AppDatabase,
  ticketIds: string[],
): Map<string, Label[]> {
  const rows = database
    .select({ ticketId: ticketLabels.ticketId, label: labelColumns })
    .from(ticketLabels)
    .innerJoin(labels, eq(labels.id, ticketLabels.labelId))
    .where(inArray(ticketLabels.ticketId, ticketIds))
    .orderBy(byName)
    .all();

  const labelsByTicket = new Map<string, Label[]>();
  for (const { ticketId, label } of rows) {
    labelsByTicket.set(ticketId, [...(labelsByTicket.get(ticketId) ?? []), label]);
  }
  return labelsByTicket;
}

export function findTicketLabelIds(database: AppDatabase, ticketId: string): number[] {
  return database
    .select({ labelId: ticketLabels.labelId })
    .from(ticketLabels)
    .where(eq(ticketLabels.ticketId, ticketId))
    .all()
    .map((row) => row.labelId);
}

export function replaceTicketLabels(
  database: AppDatabase,
  ticketId: string,
  labelIds: number[],
): void {
  database.delete(ticketLabels).where(eq(ticketLabels.ticketId, ticketId)).run();
  if (labelIds.length > 0) {
    database
      .insert(ticketLabels)
      .values(labelIds.map((labelId) => ({ ticketId, labelId })))
      .run();
  }
}

/** The ids among `labelIds` that are not labels of the project. */
export function findForeignLabelIds(
  database: AppDatabase,
  projectId: string,
  labelIds: number[],
): number[] {
  const projectLabelIds = database
    .select({ id: labels.id })
    .from(labels)
    .where(and(eq(labels.projectId, projectId), inArray(labels.id, labelIds)))
    .all()
    .map((row) => row.id);
  return labelIds.filter((labelId) => !projectLabelIds.includes(labelId));
}
