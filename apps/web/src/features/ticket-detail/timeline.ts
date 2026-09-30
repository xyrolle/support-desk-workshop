import type { Comment, TicketEvent } from "@support-desk/shared";

export type TimelineEntry =
  | { kind: "comment"; comment: Comment }
  | { kind: "event"; event: TicketEvent };

/**
 * The conversation and the activity in one stream, oldest first. A reply and the status
 * change that goes with it share a timestamp: the reply comes first, as it was written.
 */
export function buildTimeline(comments: Comment[], events: TicketEvent[]): TimelineEntry[] {
  const entries: TimelineEntry[] = [
    ...comments.map((comment) => ({ kind: "comment" as const, comment })),
    ...events.map((event) => ({ kind: "event" as const, event })),
  ];
  return entries.toSorted(byTimeThenCommentsFirst);
}

function byTimeThenCommentsFirst(first: TimelineEntry, second: TimelineEntry): number {
  const byTime = createdAt(first).localeCompare(createdAt(second));
  if (byTime !== 0) {
    return byTime;
  }
  return kindOrder(first) - kindOrder(second);
}

function createdAt(entry: TimelineEntry): string {
  return entry.kind === "comment" ? entry.comment.createdAt : entry.event.createdAt;
}

function kindOrder(entry: TimelineEntry): number {
  return entry.kind === "comment" ? 0 : 1;
}
