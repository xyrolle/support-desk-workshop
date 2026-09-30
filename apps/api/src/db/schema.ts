import {
  avatarColors,
  commentKinds,
  customerTiers,
  labelColors,
  projectRoles,
  ticketEventTypes,
  ticketPriorities,
  ticketStatuses,
} from "@support-desk/shared";
import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
  unique,
} from "drizzle-orm/sqlite-core";

// Timestamps are UTC ISO 8601 strings ("2026-09-29T09:00:00.000Z"), so they
// sort correctly as text. Calendar dates are "YYYY-MM-DD".

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  initials: text("initials").notNull(),
  email: text("email").notNull().unique(),
  avatarColor: text("avatar_color", { enum: avatarColors }).notNull(),
});

export const projects = sqliteTable("projects", {
  id: text("id").primaryKey(),
  key: text("key").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  timeZone: text("time_zone").notNull(),
});

export const projectMembers = sqliteTable(
  "project_members",
  {
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    role: text("role", { enum: projectRoles }).notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.projectId, table.userId] }),
    index("project_members_user_idx").on(table.userId),
  ],
);

export const organizations = sqliteTable("organizations", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  domain: text("domain").notNull().unique(),
  tier: text("tier", { enum: customerTiers }).notNull(),
  customerSince: text("customer_since").notNull(),
});

export const contacts = sqliteTable(
  "contacts",
  {
    id: integer("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
  },
  (table) => [index("contacts_organization_idx").on(table.organizationId)],
);

export const labels = sqliteTable(
  "labels",
  {
    id: integer("id").primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id),
    name: text("name").notNull(),
    color: text("color", { enum: labelColors }).notNull(),
  },
  (table) => [unique("labels_project_name_unique").on(table.projectId, table.name)],
);

export const tickets = sqliteTable(
  "tickets",
  {
    /** The project key and number, such as "CHK-104". */
    id: text("id").primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id),
    number: integer("number").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    status: text("status", { enum: ticketStatuses }).notNull(),
    priority: text("priority", { enum: ticketPriorities }).notNull(),
    assigneeId: text("assignee_id").references(() => users.id),
    requesterId: integer("requester_id")
      .notNull()
      .references(() => contacts.id),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
    firstRespondedAt: text("first_responded_at"),
    resolvedAt: text("resolved_at"),
  },
  (table) => [
    unique("tickets_project_number_unique").on(table.projectId, table.number),
    index("tickets_project_updated_at_idx").on(table.projectId, table.updatedAt),
    index("tickets_assignee_idx").on(table.assigneeId),
    index("tickets_requester_idx").on(table.requesterId),
  ],
);

export const ticketLabels = sqliteTable(
  "ticket_labels",
  {
    ticketId: text("ticket_id")
      .notNull()
      .references(() => tickets.id),
    labelId: integer("label_id")
      .notNull()
      .references(() => labels.id),
  },
  (table) => [
    primaryKey({ columns: [table.ticketId, table.labelId] }),
    index("ticket_labels_label_idx").on(table.labelId),
  ],
);

export const comments = sqliteTable(
  "comments",
  {
    id: integer("id").primaryKey(),
    ticketId: text("ticket_id")
      .notNull()
      .references(() => tickets.id),
    kind: text("kind", { enum: commentKinds }).notNull(),
    /** Set for public replies and internal notes. */
    authorUserId: text("author_user_id").references(() => users.id),
    /** Set for customer messages. */
    authorContactId: integer("author_contact_id").references(() => contacts.id),
    body: text("body").notNull(),
    createdAt: text("created_at").notNull(),
  },
  (table) => [
    index("comments_ticket_created_at_idx").on(table.ticketId, table.createdAt),
    check(
      "comments_author_matches_kind",
      sql`(${table.kind} = 'customer_message' and ${table.authorContactId} is not null and ${table.authorUserId} is null)
        or (${table.kind} != 'customer_message' and ${table.authorUserId} is not null and ${table.authorContactId} is null)`,
    ),
  ],
);

/**
 * The ticket's activity: one row per change of status, priority, assignee or
 * label. `fromValue` and `toValue` hold the status or priority, the assignee's
 * user id, or the label id (as text); `null` means "none".
 */
export const ticketEvents = sqliteTable(
  "ticket_events",
  {
    id: integer("id").primaryKey(),
    ticketId: text("ticket_id")
      .notNull()
      .references(() => tickets.id),
    /** `null` when Support Desk made the change automatically. */
    actorId: text("actor_id").references(() => users.id),
    type: text("type", { enum: ticketEventTypes }).notNull(),
    fromValue: text("from_value"),
    toValue: text("to_value"),
    createdAt: text("created_at").notNull(),
  },
  (table) => [index("ticket_events_ticket_created_at_idx").on(table.ticketId, table.createdAt)],
);

/** A member's private filter, visible only to them. `filters` is JSON text. */
export const savedViews = sqliteTable(
  "saved_views",
  {
    id: integer("id").primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id),
    ownerId: text("owner_id")
      .notNull()
      .references(() => users.id),
    name: text("name").notNull(),
    filters: text("filters").notNull(),
    createdAt: text("created_at").notNull(),
  },
  (table) => [
    unique("saved_views_owner_name_unique").on(table.projectId, table.ownerId, table.name),
    index("saved_views_owner_idx").on(table.projectId, table.ownerId),
  ],
);

export type UserRow = typeof users.$inferSelect;
export type ProjectRow = typeof projects.$inferSelect;
export type ProjectMemberRow = typeof projectMembers.$inferSelect;
export type OrganizationRow = typeof organizations.$inferSelect;
export type ContactRow = typeof contacts.$inferSelect;
export type LabelRow = typeof labels.$inferSelect;
export type TicketRow = typeof tickets.$inferSelect;
export type TicketLabelRow = typeof ticketLabels.$inferSelect;
export type NewCommentRow = typeof comments.$inferInsert;
export type TicketEventRow = typeof ticketEvents.$inferSelect;
export type NewTicketEventRow = typeof ticketEvents.$inferInsert;
export type SavedViewRow = typeof savedViews.$inferSelect;
