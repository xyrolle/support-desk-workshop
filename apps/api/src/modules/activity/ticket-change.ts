import type { TicketPriority, TicketStatus } from "@support-desk/shared";

/** One change to a ticket, as the activity records it. Assignees are user ids. */
export type TicketChange =
  | { type: "status_changed"; from: TicketStatus; to: TicketStatus }
  | { type: "priority_changed"; from: TicketPriority; to: TicketPriority }
  | { type: "assignee_changed"; from: string | null; to: string | null }
  | { type: "label_added"; labelId: number }
  | { type: "label_removed"; labelId: number };

/** A change about to be recorded: which ticket, who made it (`null`: Support Desk) and when. */
export type NewTicketEvent = TicketChange & {
  ticketId: string;
  actorId: string | null;
  createdAt: string;
};
