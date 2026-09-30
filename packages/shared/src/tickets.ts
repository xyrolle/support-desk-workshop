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

/** One piece of a search passage. Highlighted pieces are the words that matched. */
export const snippetPartSchema = z.object({
  text: z.string(),
  highlighted: z.boolean(),
});

export type SnippetPart = z.infer<typeof snippetPartSchema>;

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
  /** The best matching passage. Present only when the list was a search. */
  snippet: z.array(snippetPartSchema).optional(),
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

/**
 * One query parameter or several repeats (`?status=open` or `?status=open&status=blocked`).
 * Hono passes a single value as a string and repeats as an array.
 */
function repeated<Item extends z.ZodType>(item: Item) {
  return z
    .union([item, z.array(item)])
    .transform((value) => (Array.isArray(value) ? value : [value]))
    .optional();
}

/** Filters shared by a project's ticket list and its saved views. Values inside one field are OR. */
export const ticketFiltersSchema = z.object({
  status: repeated(ticketStatusSchema),
  priority: repeated(ticketPrioritySchema),
  /** A teammate id, `me` (the current user) or `unassigned`. */
  assignee: repeated(z.string().min(1)),
  /** A label id of the project. */
  label: repeated(z.coerce.number().int().positive()),
});

export type TicketFilters = z.infer<typeof ticketFiltersSchema>;

/** Query of every ticket list: a project's tickets, "My tickets" and an organization's tickets. */
export const ticketListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  sort: ticketSortSchema.default("updated"),
  direction: sortDirectionSchema.default("desc"),
});

export type TicketListQuery = z.infer<typeof ticketListQuerySchema>;

/**
 * Full-text query. Trimmed; a blank value means no search. Longer than 100
 * characters is rejected.
 */
export const ticketSearchSchema = z.string().trim().max(100).optional();

/**
 * A project's ticket list: the shared paging and sort, plus the four filters and
 * search. `sort` stays optional so a search with no sort can rank by relevance.
 */
export const projectTicketListQuerySchema = ticketListQuerySchema.extend({
  ...ticketFiltersSchema.shape,
  q: ticketSearchSchema,
  sort: ticketSortSchema.optional(),
});

export type ProjectTicketListQuery = z.infer<typeof projectTicketListQuerySchema>;

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

const MAX_BULK_UPDATES = 100;

/**
 * Body of PATCH /api/projects/:projectId/tickets. Each ticket at most once.
 * `changes` is the same object as the single-ticket PATCH.
 */
export const bulkTicketUpdateSchema = z
  .strictObject({
    updates: z
      .array(
        z.strictObject({
          ticketId: z.string().min(1),
          changes: ticketChangesSchema,
        }),
      )
      .min(1)
      .max(MAX_BULK_UPDATES),
  })
  .refine(
    (body) => new Set(body.updates.map((update) => update.ticketId)).size === body.updates.length,
    { error: "Each ticket can appear only once.", path: ["updates"] },
  );

export type BulkTicketUpdate = z.infer<typeof bulkTicketUpdateSchema>;

/** A ticket's editable fields before a bulk change, so the client can undo it. */
export const ticketStateSchema = z.object({
  ticketId: z.string(),
  status: ticketStatusSchema,
  priority: ticketPrioritySchema,
  assigneeId: z.string().nullable(),
  labelIds: z.array(z.number().int()),
});

export type TicketState = z.infer<typeof ticketStateSchema>;

export const bulkTicketUpdateResultSchema = z.object({
  tickets: z.array(ticketListItemSchema),
  previous: z.array(ticketStateSchema),
});

export type BulkTicketUpdateResult = z.infer<typeof bulkTicketUpdateResultSchema>;
