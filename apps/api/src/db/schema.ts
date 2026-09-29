import { avatarColors, ticketPriorities, ticketStatuses } from "@support-desk/shared";
import { index, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  initials: text("initials").notNull(),
  avatarColor: text("avatar_color", { enum: avatarColors }).notNull(),
});

export const projects = sqliteTable("projects", {
  id: text("id").primaryKey(),
  key: text("key").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull(),
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
  },
  (table) => [primaryKey({ columns: [table.projectId, table.userId] })],
);

export const tickets = sqliteTable(
  "tickets",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id),
    title: text("title").notNull(),
    description: text("description").notNull(),
    status: text("status", { enum: ticketStatuses }).notNull(),
    priority: text("priority", { enum: ticketPriorities }).notNull(),
    assigneeId: text("assignee_id").references(() => users.id),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [index("tickets_project_updated_at_idx").on(table.projectId, table.updatedAt)],
);

export type TicketRow = typeof tickets.$inferSelect;
export type ProjectMemberRow = typeof projectMembers.$inferInsert;
