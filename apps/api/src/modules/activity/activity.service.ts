import type { TicketEvent } from "@support-desk/shared";
import type { RequestContext } from "../../request-context.ts";
import { requireTicket } from "../tickets/tickets.service.ts";
import { findTicketEvents } from "./activity.repository.ts";

export function listActivity(
  context: RequestContext,
  projectId: string,
  ticketId: string,
): TicketEvent[] {
  const ticket = requireTicket(context, projectId, ticketId);
  return findTicketEvents(context.database, ticket);
}
