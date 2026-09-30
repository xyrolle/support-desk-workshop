import {
  type Label,
  type TicketEvent,
  ticketPrioritySchema,
  ticketStatusSchema,
  type User,
} from "@support-desk/shared";
import { asc, eq } from "drizzle-orm";
import type { AppDatabase } from "../../db/client.ts";
import { type NewTicketEventRow, type TicketEventRow, ticketEvents } from "../../db/schema.ts";
import { findProjectLabels } from "../labels/labels.repository.ts";
import { findAllUsers } from "../users/users.repository.ts";
import type { NewTicketEvent } from "./ticket-change.ts";

/** Call it in the same transaction as the change it records. */
export function recordTicketEvents(database: AppDatabase, events: NewTicketEvent[]): void {
  if (events.length > 0) {
    database.insert(ticketEvents).values(events.map(toTicketEventRow)).run();
  }
}

export function toTicketEventRow(event: NewTicketEvent): NewTicketEventRow {
  const fields = {
    ticketId: event.ticketId,
    actorId: event.actorId,
    type: event.type,
    createdAt: event.createdAt,
  };
  switch (event.type) {
    case "label_added":
      return { ...fields, fromValue: null, toValue: String(event.labelId) };
    case "label_removed":
      return { ...fields, fromValue: String(event.labelId), toValue: null };
    default:
      return { ...fields, fromValue: event.from, toValue: event.to };
  }
}

/** The ticket's activity, oldest first, with people and labels filled in. */
export function findTicketEvents(
  database: AppDatabase,
  ticket: { id: string; projectId: string },
): TicketEvent[] {
  const rows = database
    .select()
    .from(ticketEvents)
    .where(eq(ticketEvents.ticketId, ticket.id))
    .orderBy(asc(ticketEvents.createdAt), asc(ticketEvents.id))
    .all();

  const lookup = new EventLookup(
    findAllUsers(database),
    findProjectLabels(database, ticket.projectId),
  );
  return rows.map((row) => toTicketEvent(row, lookup));
}

function toTicketEvent(row: TicketEventRow, lookup: EventLookup): TicketEvent {
  const fields = {
    id: row.id,
    ticketId: row.ticketId,
    actor: lookup.userOrNull(row.actorId),
    createdAt: row.createdAt,
  };
  switch (row.type) {
    case "status_changed":
      return {
        ...fields,
        type: row.type,
        from: ticketStatusSchema.parse(row.fromValue),
        to: ticketStatusSchema.parse(row.toValue),
      };
    case "priority_changed":
      return {
        ...fields,
        type: row.type,
        from: ticketPrioritySchema.parse(row.fromValue),
        to: ticketPrioritySchema.parse(row.toValue),
      };
    case "assignee_changed":
      return {
        ...fields,
        type: row.type,
        from: lookup.userOrNull(row.fromValue),
        to: lookup.userOrNull(row.toValue),
      };
    case "label_added":
      return { ...fields, type: row.type, label: lookup.label(row.toValue) };
    case "label_removed":
      return { ...fields, type: row.type, label: lookup.label(row.fromValue) };
  }
}

/** Finds the people and labels that events refer to by id. */
class EventLookup {
  readonly #usersById: Map<string, User>;
  readonly #labelsById: Map<string, Label>;

  constructor(users: User[], labels: Label[]) {
    this.#usersById = new Map(users.map((user) => [user.id, user]));
    this.#labelsById = new Map(labels.map((label) => [String(label.id), label]));
  }

  userOrNull(userId: string | null): User | null {
    if (userId === null) {
      return null;
    }
    const user = this.#usersById.get(userId);
    if (!user) {
      throw new Error(`An event refers to the unknown user "${userId}".`);
    }
    return user;
  }

  label(labelId: string | null): Label {
    const label = labelId === null ? undefined : this.#labelsById.get(labelId);
    if (!label) {
      throw new Error(`An event refers to the unknown label "${labelId}".`);
    }
    return label;
  }
}
