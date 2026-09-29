import type { TicketListQuery, TicketPage, User } from "@support-desk/shared";
import { requireProjectAccess } from "../../auth/access.ts";
import type { AppDatabase } from "../../db/client.ts";
import { buildPage, pageRange } from "../../http/pagination.ts";
import { countTickets, findTickets, type TicketFilter } from "./tickets.repository.ts";

export function listProjectTickets(
  database: AppDatabase,
  user: User,
  projectId: string,
  query: TicketListQuery,
): TicketPage {
  requireProjectAccess(database, user, projectId);

  const filter: TicketFilter = { projectId };
  const items = findTickets(database, filter, pageRange(query.page));
  const totalItems = countTickets(database, filter);

  return buildPage({ items, page: query.page, totalItems });
}
