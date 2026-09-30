import type { CommentKind, TicketPriority, TicketStatus } from "@support-desk/shared";

export type HistoryComment = {
  minute: number;
  kind: CommentKind;
  /** The teammate who wrote it; `null` for the requester's messages. */
  authorId: string | null;
  body: string;
};

type HistoryEventFields = {
  minute: number;
  /** `null` when Support Desk made the change automatically. */
  actorId: string | null;
};

export type HistoryEvent = HistoryEventFields &
  (
    | { type: "status_changed"; from: TicketStatus; to: TicketStatus }
    | { type: "priority_changed"; from: TicketPriority; to: TicketPriority }
    | { type: "assignee_changed"; from: string | null; to: string | null }
    | { type: "label_added"; labelName: string }
  );

/**
 * A ticket's history as it is written, in minutes since the ticket was opened.
 * Every change is recorded as an event, so the final state and the activity
 * always agree.
 */
export class TicketHistory {
  status: TicketStatus = "open";
  priority: TicketPriority;
  assigneeId: string | null = null;
  readonly labelNames: string[] = [];
  readonly comments: HistoryComment[] = [];
  readonly events: HistoryEvent[] = [];
  #minute = 0;

  constructor(priority: TicketPriority) {
    this.priority = priority;
  }

  /** Minutes since the ticket was opened. */
  get minute(): number {
    return this.#minute;
  }

  /** When the last comment or change happened, in minutes since the ticket was opened. */
  get lastActivityMinute(): number {
    const minutes = [...this.comments, ...this.events].map((entry) => entry.minute);
    return Math.max(0, ...minutes);
  }

  wait(minutes: number): void {
    this.#minute += minutes;
  }

  comment(kind: CommentKind, authorId: string | null, body: string): void {
    this.comments.push({ minute: this.#minute, kind, authorId, body });
  }

  changeStatus(actorId: string | null, status: TicketStatus): void {
    this.events.push({
      minute: this.#minute,
      actorId,
      type: "status_changed",
      from: this.status,
      to: status,
    });
    this.status = status;
  }

  changePriority(actorId: string, priority: TicketPriority): void {
    this.events.push({
      minute: this.#minute,
      actorId,
      type: "priority_changed",
      from: this.priority,
      to: priority,
    });
    this.priority = priority;
  }

  assign(actorId: string, assigneeId: string): void {
    this.events.push({
      minute: this.#minute,
      actorId,
      type: "assignee_changed",
      from: this.assigneeId,
      to: assigneeId,
    });
    this.assigneeId = assigneeId;
  }

  addLabel(actorId: string, labelName: string): void {
    this.events.push({ minute: this.#minute, actorId, type: "label_added", labelName });
    this.labelNames.push(labelName);
  }
}
