import { z } from "zod";
import { labelSchema } from "./labels.ts";
import { ticketPrioritySchema, ticketStatusSchema } from "./tickets.ts";
import { userSchema } from "./users.ts";

export const ticketEventTypes = [
  "status_changed",
  "priority_changed",
  "assignee_changed",
  "label_added",
  "label_removed",
] as const;

export const ticketEventTypeSchema = z.enum(ticketEventTypes);

export type TicketEventType = z.infer<typeof ticketEventTypeSchema>;

const eventFields = {
  id: z.number().int(),
  ticketId: z.string(),
  /** The teammate who made the change; `null` when Support Desk did it automatically. */
  actor: userSchema.nullable(),
  createdAt: z.iso.datetime(),
};

const statusChangedEventSchema = z.object({
  ...eventFields,
  type: z.literal("status_changed"),
  from: ticketStatusSchema,
  to: ticketStatusSchema,
});

const priorityChangedEventSchema = z.object({
  ...eventFields,
  type: z.literal("priority_changed"),
  from: ticketPrioritySchema,
  to: ticketPrioritySchema,
});

const assigneeChangedEventSchema = z.object({
  ...eventFields,
  type: z.literal("assignee_changed"),
  from: userSchema.nullable(),
  to: userSchema.nullable(),
});

const labelAddedEventSchema = z.object({
  ...eventFields,
  type: z.literal("label_added"),
  label: labelSchema,
});

const labelRemovedEventSchema = z.object({
  ...eventFields,
  type: z.literal("label_removed"),
  label: labelSchema,
});

/** One change to a ticket's status, priority, assignee or labels. */
export const ticketEventSchema = z.discriminatedUnion("type", [
  statusChangedEventSchema,
  priorityChangedEventSchema,
  assigneeChangedEventSchema,
  labelAddedEventSchema,
  labelRemovedEventSchema,
]);

export type TicketEvent = z.infer<typeof ticketEventSchema>;
