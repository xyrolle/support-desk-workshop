import { z } from "zod";
import { pageSchema } from "./pagination.ts";
import { userSchema } from "./users.ts";

export const ticketStatuses = ["open", "in_progress", "blocked", "closed"] as const;

export const ticketStatusSchema = z.enum(ticketStatuses);

export type TicketStatus = z.infer<typeof ticketStatusSchema>;

export const ticketPriorities = ["low", "medium", "high", "urgent"] as const;

export const ticketPrioritySchema = z.enum(ticketPriorities);

export type TicketPriority = z.infer<typeof ticketPrioritySchema>;

export const ticketSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  title: z.string(),
  description: z.string(),
  status: ticketStatusSchema,
  priority: ticketPrioritySchema,
  assignee: userSchema.nullable(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export type Ticket = z.infer<typeof ticketSchema>;

export const ticketListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
});

export type TicketListQuery = z.infer<typeof ticketListQuerySchema>;

export const ticketPageSchema = pageSchema(ticketSchema);

export type TicketPage = z.infer<typeof ticketPageSchema>;
