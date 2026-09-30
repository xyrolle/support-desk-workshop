import type { CustomerTier } from "./customers.ts";
import type { ProjectRole } from "./projects.ts";
import type { TicketPriority, TicketStatus } from "./tickets.ts";

// How each value is written in the UI and in reports.

export const statusNames: Record<TicketStatus, string> = {
  open: "Open",
  in_progress: "In progress",
  blocked: "Waiting on customer",
  resolved: "Resolved",
  closed: "Closed",
};

export const priorityNames: Record<TicketPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

export const roleNames: Record<ProjectRole, string> = {
  viewer: "Viewer",
  agent: "Agent",
  admin: "Admin",
};

export const tierNames: Record<CustomerTier, string> = {
  free: "Free",
  pro: "Pro",
  enterprise: "Enterprise",
};
