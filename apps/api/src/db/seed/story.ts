import type { CommentKind, CustomerTier, TicketPriority, TicketStatus } from "@support-desk/shared";

/**
 * A hand-written ticket. The seed gives it a requester, an assignee, a status
 * and a history (see generated-history.ts); the words come from here.
 * In every text, `{name}` becomes the requester's first name.
 */
export type TicketStory = {
  title: string;
  /** Markdown, in the requester's words. */
  description: string;
  priority: TicketPriority;
  /** Names of labels from the project's label set. */
  labels: string[];
  /** An internal note a teammate writes while investigating. */
  note: string;
  /** The public reply that resolves the ticket. */
  resolution: string;
  /** Set when only a customer on this plan could have written it (it mentions SSO, their contract...). */
  tier?: CustomerTier;
};

/** A ticket whose whole conversation is written out: the long threads in the demo data. */
export type TicketThread = {
  title: string;
  description: string;
  priority: TicketPriority;
  labels: string[];
  status: TicketStatus;
  assigneeId: string;
  /** The requester is this organization's first contact. */
  organizationId: string;
  /** Hours between the last message and the seed date. */
  quietForHours: number;
  messages: ThreadMessage[];
};

export type ThreadMessage = {
  kind: CommentKind;
  /** The teammate who writes a reply or note; defaults to the assignee. */
  authorId?: string;
  /** Minutes after the previous message, or after the ticket was opened for the first one. */
  afterMinutes: number;
  body: string;
  /** The ticket moves to this status with the message. */
  statusChange?: TicketStatus;
};

export type ProjectStories = {
  stories: TicketStory[];
  threads: TicketThread[];
};
