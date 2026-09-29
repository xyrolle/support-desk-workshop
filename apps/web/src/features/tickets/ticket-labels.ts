import type { TicketPriority, TicketStatus } from "@support-desk/shared";

export const statusLabels: Record<TicketStatus, string> = {
  open: "Open",
  in_progress: "In progress",
  blocked: "Blocked",
  closed: "Closed",
};

export const priorityLabels: Record<TicketPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};
