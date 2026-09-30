import type { Comment } from "@support-desk/shared";
import { and, asc, eq } from "drizzle-orm";
import type { AppDatabase } from "../../db/client.ts";
import {
  type ContactRow,
  comments,
  contacts,
  type NewCommentRow,
  type UserRow,
  users,
} from "../../db/schema.ts";

type CommentQueryRow = {
  comment: typeof comments.$inferSelect;
  user: UserRow | null;
  contact: ContactRow | null;
};

function selectComments(database: AppDatabase) {
  return database
    .select({ comment: comments, user: users, contact: contacts })
    .from(comments)
    .leftJoin(users, eq(users.id, comments.authorUserId))
    .leftJoin(contacts, eq(contacts.id, comments.authorContactId));
}

/** The ticket's conversation, oldest first. */
export function findTicketComments(database: AppDatabase, ticketId: string): Comment[] {
  return selectComments(database)
    .where(eq(comments.ticketId, ticketId))
    .orderBy(asc(comments.createdAt), asc(comments.id))
    .all()
    .map(toComment);
}

export function findComment(
  database: AppDatabase,
  ticketId: string,
  commentId: number,
): Comment | undefined {
  const row = selectComments(database)
    .where(and(eq(comments.ticketId, ticketId), eq(comments.id, commentId)))
    .get();
  return row && toComment(row);
}

/** Returns the new comment's id. */
export function insertComment(database: AppDatabase, comment: NewCommentRow): number {
  const [inserted] = database.insert(comments).values(comment).returning({ id: comments.id }).all();
  if (!inserted) {
    throw new Error("SQLite did not return the new comment's id.");
  }
  return inserted.id;
}

// The table's check constraint guarantees that customer messages have a
// contact and every other comment has a teammate as its author.
function toComment({ comment, user, contact }: CommentQueryRow): Comment {
  const fields = {
    id: comment.id,
    ticketId: comment.ticketId,
    body: comment.body,
    createdAt: comment.createdAt,
  };
  if (comment.kind === "customer_message") {
    if (!contact) {
      throw new Error(`Customer message ${comment.id} has no contact.`);
    }
    return {
      ...fields,
      kind: comment.kind,
      author: { id: contact.id, name: contact.name, email: contact.email },
    };
  }
  if (!user) {
    throw new Error(`Comment ${comment.id} has no author.`);
  }
  return { ...fields, kind: comment.kind, author: user };
}
