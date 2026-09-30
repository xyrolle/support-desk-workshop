import { ticketRef } from "@support-desk/shared";
import { addMinutes } from "../../lib/dates.ts";
import { toTicketEventRow } from "../../modules/activity/activity.repository.ts";
import type { NewTicketEvent } from "../../modules/activity/ticket-change.ts";
import { type ResolutionState, resolvedAtAfter } from "../../modules/tickets/resolution.ts";
import type { NewCommentRow, NewTicketEventRow, TicketLabelRow, TicketRow } from "../schema.ts";
import type { HistoryEvent, TicketHistory } from "./ticket-history.ts";

/** A ticket with its history, placed in time: `openedAt` is when the requester wrote it. */
export type PlacedTicket = {
  projectId: string;
  projectKey: string;
  number: number;
  title: string;
  description: string;
  requesterId: number;
  openedAt: Date;
  history: TicketHistory;
};

export type TicketRows = {
  ticket: TicketRow;
  ticketLabels: TicketLabelRow[];
  comments: NewCommentRow[];
  events: NewTicketEventRow[];
};

/** Finds a label's id by project and name. */
export type LabelLookup = (projectId: string, labelName: string) => number;

export function toTicketRows(placed: PlacedTicket, labelIdOf: LabelLookup): TicketRows {
  const { history } = placed;
  const id = ticketRef(placed.projectKey, placed.number);
  const timestamp = (minute: number) => addMinutes(placed.openedAt, minute).toISOString();
  const firstReply = history.comments.find((comment) => comment.kind === "public_reply");

  const ticket: TicketRow = {
    id,
    projectId: placed.projectId,
    number: placed.number,
    title: placed.title,
    description: placed.description,
    status: history.status,
    priority: history.priority,
    assigneeId: history.assigneeId,
    requesterId: placed.requesterId,
    createdAt: timestamp(0),
    updatedAt: timestamp(history.lastActivityMinute),
    firstRespondedAt: firstReply ? timestamp(firstReply.minute) : null,
    resolvedAt: resolvedAtOf(history, timestamp),
  };

  const comments = history.comments.map((comment) => ({
    ticketId: id,
    kind: comment.kind,
    authorUserId: comment.authorId,
    authorContactId: comment.authorId === null ? placed.requesterId : null,
    body: comment.body,
    createdAt: timestamp(comment.minute),
  }));

  const events = history.events.map((event) =>
    toTicketEventRow(
      toNewTicketEvent(event, {
        ticketId: id,
        createdAt: timestamp(event.minute),
        labelIdOf: (labelName) => labelIdOf(placed.projectId, labelName),
      }),
    ),
  );

  const ticketLabels = history.labelNames.map((labelName) => ({
    ticketId: id,
    labelId: labelIdOf(placed.projectId, labelName),
  }));

  return { ticket, ticketLabels, comments, events };
}

type EventPlacement = {
  ticketId: string;
  createdAt: string;
  labelIdOf: (labelName: string) => number;
};

function toNewTicketEvent(event: HistoryEvent, placement: EventPlacement): NewTicketEvent {
  const fields = {
    ticketId: placement.ticketId,
    actorId: event.actorId,
    createdAt: placement.createdAt,
  };
  if (event.type === "label_added") {
    return { ...fields, type: event.type, labelId: placement.labelIdOf(event.labelName) };
  }
  // What is left without the minute is the change itself.
  const { minute, ...change } = event;
  return { ...change, ...fields };
}

/** Replays the status changes with the same rule the API uses. */
function resolvedAtOf(
  history: TicketHistory,
  timestamp: (minute: number) => string,
): string | null {
  let state: ResolutionState = { status: "open", resolvedAt: null };
  for (const event of history.events) {
    if (event.type === "status_changed") {
      const resolvedAt = resolvedAtAfter(state, event.to, timestamp(event.minute));
      state = { status: event.to, resolvedAt };
    }
  }
  return state.resolvedAt;
}
