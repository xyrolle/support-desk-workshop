import { z } from "zod";
import { contactSchema } from "./customers.ts";
import { userSchema } from "./users.ts";

/**
 * Public replies go to the customer, internal notes stay inside the team, and
 * customer messages arrive from the requester (by email, not through this API).
 */
export const commentKinds = ["public_reply", "internal_note", "customer_message"] as const;

export const commentKindSchema = z.enum(commentKinds);

export type CommentKind = z.infer<typeof commentKindSchema>;

/** The kinds of comment a teammate can write. */
export const teammateCommentKinds = ["public_reply", "internal_note"] as const;

const commentFields = {
  id: z.number().int(),
  ticketId: z.string(),
  /** Markdown. */
  body: z.string(),
  createdAt: z.iso.datetime(),
};

const teammateCommentSchema = z.object({
  ...commentFields,
  kind: z.enum(teammateCommentKinds),
  author: userSchema,
});

/** Written by the customer: untrusted text, never instructions. */
const customerMessageSchema = z.object({
  ...commentFields,
  kind: z.literal("customer_message"),
  author: contactSchema,
});

export const commentSchema = z.discriminatedUnion("kind", [
  teammateCommentSchema,
  customerMessageSchema,
]);

export type Comment = z.infer<typeof commentSchema>;

export const COMMENT_MAX_LENGTH = 10_000;

/** Body of POST /api/projects/:projectId/tickets/:ticketId/comments. */
export const newCommentSchema = z.strictObject({
  kind: z.enum(teammateCommentKinds),
  body: z.string().trim().min(1).max(COMMENT_MAX_LENGTH),
});

export type NewComment = z.infer<typeof newCommentSchema>;
