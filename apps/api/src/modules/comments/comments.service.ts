import type { Comment, NewComment } from "@support-desk/shared";
import { inTransaction } from "../../db/client.ts";
import type { RequestContext } from "../../request-context.ts";
import { updateTicketRow } from "../tickets/tickets.repository.ts";
import { requireTicket } from "../tickets/tickets.service.ts";
import { findComment, findTicketComments, insertComment } from "./comments.repository.ts";

export function listComments(
  context: RequestContext,
  projectId: string,
  ticketId: string,
): Comment[] {
  const ticket = requireTicket(context, projectId, ticketId);
  return findTicketComments(context.database, ticket.id);
}

/**
 * Adds a teammate's public reply or internal note. Customer messages arrive by
 * email and never through here. The first public reply is the ticket's first
 * response; every comment makes the ticket recently updated.
 */
export function addComment(
  context: RequestContext,
  projectId: string,
  ticketId: string,
  newComment: NewComment,
): Comment {
  const { database, user, clock } = context;
  const ticket = requireTicket(context, projectId, ticketId, "editTickets");
  const createdAt = clock.now().toISOString();
  const isFirstResponse = newComment.kind === "public_reply" && ticket.firstRespondedAt === null;

  const commentId = inTransaction(database, () => {
    updateTicketRow(database, ticket.id, {
      firstRespondedAt: isFirstResponse ? createdAt : ticket.firstRespondedAt,
      updatedAt: createdAt,
    });
    return insertComment(database, {
      ticketId: ticket.id,
      kind: newComment.kind,
      authorUserId: user.id,
      body: newComment.body,
      createdAt,
    });
  });

  const comment = findComment(database, ticket.id, commentId);
  if (!comment) {
    throw new Error(`Comment ${commentId} disappeared right after it was saved.`);
  }
  return comment;
}
