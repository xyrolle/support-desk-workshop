import type { Ticket, User } from "@support-desk/shared";
import { count, desc, eq, type SQL } from "drizzle-orm";
import type { AppDatabase } from "../../db/client.ts";
import { type TicketRow, tickets, users } from "../../db/schema.ts";
import type { PageRange } from "../../http/pagination.ts";

export type TicketFilter = {
  projectId: string;
};

export function findTickets(
  database: AppDatabase,
  filter: TicketFilter,
  range: PageRange,
): Ticket[] {
  const rows = database
    .select({ ticket: tickets, assignee: users })
    .from(tickets)
    .leftJoin(users, eq(tickets.assigneeId, users.id))
    .where(matchesFilter(filter))
    .orderBy(desc(tickets.updatedAt), desc(tickets.id))
    .limit(range.limit)
    .offset(range.offset)
    .all();

  return rows.map(toTicket);
}

export function countTickets(database: AppDatabase, filter: TicketFilter): number {
  const result = database
    .select({ total: count() })
    .from(tickets)
    .where(matchesFilter(filter))
    .get();

  return result?.total ?? 0;
}

function matchesFilter(filter: TicketFilter): SQL {
  return eq(tickets.projectId, filter.projectId);
}

function toTicket(row: { ticket: TicketRow; assignee: User | null }): Ticket {
  return {
    id: row.ticket.id,
    projectId: row.ticket.projectId,
    title: row.ticket.title,
    description: row.ticket.description,
    status: row.ticket.status,
    priority: row.ticket.priority,
    assignee: row.assignee,
    createdAt: row.ticket.createdAt,
    updatedAt: row.ticket.updatedAt,
  };
}
