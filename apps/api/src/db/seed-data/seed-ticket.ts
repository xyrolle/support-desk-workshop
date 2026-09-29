import type { TicketPriority, TicketStatus } from "@support-desk/shared";

/**
 * A ticket as written in the seed files. Dates are relative so the demo data
 * always looks recent; the seed turns them into timestamps.
 */
export type SeedTicket = {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  assigneeId: string | null;
  createdDaysAgo: number;
  updatedHoursAgo: number;
};
