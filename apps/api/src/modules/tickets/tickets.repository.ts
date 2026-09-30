import {
  type Label,
  type TicketDetail,
  type TicketListItem,
  type TicketListQuery,
  type TicketPriority,
  type TicketSort,
  type TicketStatus,
  ticketPriorities,
  type User,
} from "@support-desk/shared";
import { and, asc, count, desc, eq, exists, inArray, isNull, or, type SQL, sql } from "drizzle-orm";
import type { SQLiteColumn } from "drizzle-orm/sqlite-core";
import type { AppDatabase } from "../../db/client.ts";
import {
  type ContactRow,
  contacts,
  type OrganizationRow,
  organizations,
  type TicketRow,
  ticketLabels,
  tickets,
  users,
} from "../../db/schema.ts";
import type { PageRange } from "../../http/pagination.ts";
import { findLabelsOfTickets } from "../labels/labels.repository.ts";

export type TicketFilter = {
  /** Required, so a list can only ever show tickets from projects the user can see. */
  projectIds: string[];
  /** A single assignee, ANDed with the rest. Used by My tickets. */
  assigneeId?: string;
  /** Several assignees, ORed. Combined with `includeUnassigned`. */
  assigneeIds?: string[];
  includeUnassigned?: boolean;
  organizationId?: string;
  statuses?: readonly TicketStatus[];
  priorities?: readonly TicketPriority[];
  labelIds?: number[];
};

export type TicketOrder = Pick<TicketListQuery, "sort" | "direction">;

type TicketQueryRow = {
  ticket: TicketRow;
  assignee: User | null;
  requester: ContactRow;
  organization: OrganizationRow;
};

export function findTickets(
  database: AppDatabase,
  filter: TicketFilter,
  order: TicketOrder,
  range: PageRange,
): TicketListItem[] {
  const rows = selectTickets(database)
    .where(matchesFilter(database, filter))
    .orderBy(...orderBy(order))
    .limit(range.limit)
    .offset(range.offset)
    .all();

  const labelsByTicket = findLabelsOfTickets(
    database,
    rows.map((row) => row.ticket.id),
  );
  return rows.map((row) => toListItem(row, labelsByTicket.get(row.ticket.id) ?? []));
}

/** Uses the same filter as `findTickets`, so the count always matches the list. */
export function countTickets(database: AppDatabase, filter: TicketFilter): number {
  const result = database
    .select({ total: count() })
    .from(tickets)
    .innerJoin(contacts, eq(contacts.id, tickets.requesterId))
    .where(matchesFilter(database, filter))
    .get();

  return result?.total ?? 0;
}

export function findTicket(
  database: AppDatabase,
  projectId: string,
  ticketId: string,
): TicketDetail | undefined {
  const row = selectTickets(database)
    .where(and(eq(tickets.projectId, projectId), eq(tickets.id, ticketId)))
    .get();
  if (!row) {
    return undefined;
  }

  const labels = findLabelsOfTickets(database, [row.ticket.id]).get(row.ticket.id) ?? [];
  return { ...toListItem(row, labels), description: row.ticket.description };
}

export function findTicketRow(
  database: AppDatabase,
  projectId: string,
  ticketId: string,
): TicketRow | undefined {
  return database
    .select()
    .from(tickets)
    .where(and(eq(tickets.projectId, projectId), eq(tickets.id, ticketId)))
    .get();
}

/** A project's tickets assigned to someone, limited to the given statuses. */
export function findAssignedTicketRows(
  database: AppDatabase,
  projectId: string,
  assigneeId: string,
  statuses: readonly TicketStatus[],
): TicketRow[] {
  return database
    .select()
    .from(tickets)
    .where(
      and(
        eq(tickets.projectId, projectId),
        eq(tickets.assigneeId, assigneeId),
        inArray(tickets.status, [...statuses]),
      ),
    )
    .all();
}

export type TicketUpdate = Partial<
  Pick<TicketRow, "status" | "priority" | "assigneeId" | "firstRespondedAt" | "resolvedAt">
> & { updatedAt: string };

export function updateTicketRow(database: AppDatabase, ticketId: string, update: TicketUpdate) {
  database.update(tickets).set(update).where(eq(tickets.id, ticketId)).run();
}

function selectTickets(database: AppDatabase) {
  return database
    .select({ ticket: tickets, assignee: users, requester: contacts, organization: organizations })
    .from(tickets)
    .leftJoin(users, eq(users.id, tickets.assigneeId))
    .innerJoin(contacts, eq(contacts.id, tickets.requesterId))
    .innerJoin(organizations, eq(organizations.id, contacts.organizationId));
}

function matchesFilter(database: AppDatabase, filter: TicketFilter): SQL | undefined {
  return and(
    inArray(tickets.projectId, filter.projectIds),
    filter.assigneeId ? eq(tickets.assigneeId, filter.assigneeId) : undefined,
    assigneeClause(filter),
    filter.organizationId ? eq(contacts.organizationId, filter.organizationId) : undefined,
    filter.statuses ? inArray(tickets.status, [...filter.statuses]) : undefined,
    filter.priorities ? inArray(tickets.priority, [...filter.priorities]) : undefined,
    labelClause(database, filter.labelIds),
  );
}

/** Assignees in `assigneeIds` and unassigned tickets are alternatives. */
function assigneeClause(filter: TicketFilter): SQL | undefined {
  const clauses = [
    filter.assigneeIds?.length ? inArray(tickets.assigneeId, filter.assigneeIds) : undefined,
    filter.includeUnassigned ? isNull(tickets.assigneeId) : undefined,
  ].filter((clause) => clause !== undefined);
  if (clauses.length === 0) {
    return undefined;
  }
  return or(...clauses);
}

/** A ticket matches when it has any of the labels. `exists` keeps one row per ticket. */
function labelClause(database: AppDatabase, labelIds: number[] | undefined): SQL | undefined {
  if (!labelIds?.length) {
    return undefined;
  }
  return exists(
    database
      .select({ one: sql`1` })
      .from(ticketLabels)
      .where(and(eq(ticketLabels.ticketId, tickets.id), inArray(ticketLabels.labelId, labelIds))),
  );
}

/** Sorts by rank (low = 0 … urgent = 3) rather than alphabetically. */
function priorityRank(): SQL {
  const ranks = ticketPriorities.map((priority, rank) => sql`when ${priority} then ${rank}`);
  return sql`case ${tickets.priority} ${sql.join(ranks, sql` `)} end`;
}

const sortColumns: Record<TicketSort, SQLiteColumn | SQL> = {
  updated: tickets.updatedAt,
  created: tickets.createdAt,
  priority: priorityRank(),
};

/** Ties go to the most recently updated ticket, then the id, so pages never overlap. */
function orderBy({ sort, direction }: TicketOrder): SQL[] {
  const inDirection = direction === "asc" ? asc : desc;
  return [inDirection(sortColumns[sort]), desc(tickets.updatedAt), asc(tickets.id)];
}

function toListItem(row: TicketQueryRow, labels: Label[]): TicketListItem {
  const { ticket, requester, organization } = row;
  return {
    id: ticket.id,
    projectId: ticket.projectId,
    title: ticket.title,
    status: ticket.status,
    priority: ticket.priority,
    assignee: row.assignee,
    requester: {
      id: requester.id,
      name: requester.name,
      email: requester.email,
      organization: { id: organization.id, name: organization.name, tier: organization.tier },
    },
    labels,
    createdAt: ticket.createdAt,
    updatedAt: ticket.updatedAt,
    firstRespondedAt: ticket.firstRespondedAt,
    resolvedAt: ticket.resolvedAt,
  };
}
