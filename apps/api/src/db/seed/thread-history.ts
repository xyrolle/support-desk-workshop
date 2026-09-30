import type { GeneratedHistory } from "./generated-history.ts";
import type { Random } from "./random.ts";
import type { TicketThread } from "./story.ts";
import { TicketHistory } from "./ticket-history.ts";

const MINUTES_PER_HOUR = 60;

/** Threads are triaged within ten minutes, or before their first message if that is sooner. */
const TRIAGE_MINUTES = 10;

export type ThreadContext = {
  random: Random;
  triagerIds: string[];
  requesterFirstName: string;
};

/** The history of a hand-written thread: triage, then every message as written. */
export function threadHistory(thread: TicketThread, context: ThreadContext): GeneratedHistory {
  const history = new TicketHistory(thread.priority);
  const triageMinute = Math.min(TRIAGE_MINUTES, thread.messages[0]?.afterMinutes ?? 0);
  const triagerId = context.random.pick(context.triagerIds);

  history.wait(triageMinute);
  history.assign(triagerId, thread.assigneeId);
  for (const labelName of thread.labels) {
    history.addLabel(triagerId, labelName);
  }

  thread.messages.forEach((message, index) => {
    history.wait(index === 0 ? message.afterMinutes - triageMinute : message.afterMinutes);
    const authorId =
      message.kind === "customer_message" ? null : (message.authorId ?? thread.assigneeId);
    const body = message.body.replaceAll("{name}", context.requesterFirstName);
    history.comment(message.kind, authorId, body);
    if (message.statusChange) {
      history.changeStatus(authorId, message.statusChange);
    }
  });

  return { history, quietMinutes: thread.quietForHours * MINUTES_PER_HOUR };
}
