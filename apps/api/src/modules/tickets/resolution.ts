import { isResolvedStatus, type TicketStatus } from "@support-desk/shared";

export type ResolutionState = {
  status: TicketStatus;
  resolvedAt: string | null;
};

/**
 * When the ticket counts as resolved after it moves to `status`: from the
 * moment it reaches resolved or closed, unchanged from resolved to closed, and
 * cleared when it is reopened.
 */
export function resolvedAtAfter(
  ticket: ResolutionState,
  status: TicketStatus,
  changedAt: string,
): string | null {
  if (!isResolvedStatus(status)) {
    return null;
  }
  if (isResolvedStatus(ticket.status)) {
    return ticket.resolvedAt ?? changedAt;
  }
  return changedAt;
}
