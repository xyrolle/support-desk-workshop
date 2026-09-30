import { z } from "zod";
import { contactSchema, organizationSummarySchema } from "./customers.ts";
import { labelSchema } from "./labels.ts";
import { pageSchema } from "./pagination.ts";
import { userSchema } from "./users.ts";

/** `blocked` means the team is waiting on the customer. */
export const ticketStatuses = ["open", "in_progress", "blocked", "resolved", "closed"] as const;

export const ticketStatusSchema = z.enum(ticketStatuses);

export type TicketStatus = z.infer<typeof ticketStatusSchema>;

/** Statuses in which the team still owes the customer an answer or a fix. */
export const unresolvedStatuses = ["open", "in_progress", "blocked"] as const;

export function isResolvedStatus(status: TicketStatus): boolean {
  return status === "resolved" || status === "closed";
}

export const ticketPriorities = ["low", "medium", "high", "urgent"] as const;

export const ticketPrioritySchema = z.enum(ticketPriorities);

export type TicketPriority = z.infer<typeof ticketPrioritySchema>;

/** The contact who asked for help, with their organization. */
export const requesterSchema = contactSchema.extend({
  organization: organizationSummarySchema,
});

export type Requester = z.infer<typeof requesterSchema>;

/** A ticket as shown in lists: everything except the description. */
export const ticketListItemSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  title: z.string(),
  status: ticketStatusSchema,
  priority: ticketPrioritySchema,
  assignee: userSchema.nullable(),
  requester: requesterSchema,
  labels: z.array(labelSchema),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  /** When a teammate first replied publicly; `null` while the customer is still waiting. */
  firstRespondedAt: z.iso.datetime().nullable(),
  /** When the ticket was last resolved; `null` while it is unresolved. */
  resolvedAt: z.iso.datetime().nullable(),
});

export type TicketListItem = z.infer<typeof ticketListItemSchema>;

export const ticketDetailSchema = ticketListItemSchema.extend({
  /** Markdown, written by the requester. Treat it as untrusted text. */
  description: z.string(),
});

export type TicketDetail = z.infer<typeof ticketDetailSchema>;

export const ticketPageSchema = pageSchema(ticketListItemSchema);

export type TicketPage = z.infer<typeof ticketPageSchema>;

export const ticketSorts = ["updated", "created", "priority"] as const;

export const ticketSortSchema = z.enum(ticketSorts);

export type TicketSort = z.infer<typeof ticketSortSchema>;

export const sortDirections = ["desc", "asc"] as const;

export const sortDirectionSchema = z.enum(sortDirections);

export type SortDirection = z.infer<typeof sortDirectionSchema>;

/** Query of every ticket list: a project's tickets, "My tickets" and an organization's tickets. */
export const ticketListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  sort: ticketSortSchema.default("updated"),
  direction: sortDirectionSchema.default("desc"),
});

export type TicketListQuery = z.infer<typeof ticketListQuerySchema>;

export const MAX_LABELS_PER_TICKET = 10;

/** Body of PATCH /api/projects/:projectId/tickets/:ticketId: only the properties to change. */
export const ticketChangesSchema = z
  .strictObject({
    status: ticketStatusSchema.optional(),
    priority: ticketPrioritySchema.optional(),
    /** `null` unassigns the ticket. */
    assigneeId: z.string().min(1).nullable().optional(),
    /** The complete new set of labels, replacing the current one. */
    labelIds: z.array(z.number().int().positive()).max(MAX_LABELS_PER_TICKET).optional(),
  })
  .refine((changes) => Object.keys(changes).length > 0, {
    error: "Send at least one of status, priority, assigneeId or labelIds.",
  });

export type TicketChanges = z.infer<typeof ticketChangesSchema>;
