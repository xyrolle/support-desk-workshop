import { type TicketPriority, type TicketStatus, ticketPriorities } from "@support-desk/shared";
import {
  acknowledgements,
  customerAnswers,
  customerNudges,
  customerThanks,
  handoverNotes,
  infoRequests,
  progressUpdates,
} from "./conversation.ts";
import type { Random } from "./random.ts";
import type { TicketStory } from "./story.ts";
import { TicketHistory } from "./ticket-history.ts";

const MINUTES_PER_HOUR = 60;
const MINUTES_PER_DAY = 24 * MINUTES_PER_HOUR;

/** Resolved tickets close automatically after this long without a reply. */
const AUTO_CLOSE_AFTER_MINUTES = 5 * MINUTES_PER_DAY;

const finalStatusWeights: ReadonlyArray<readonly [TicketStatus, number]> = [
  ["open", 16],
  ["in_progress", 13],
  ["blocked", 8],
  ["resolved", 10],
  ["closed", 53],
];

/** How long triage and the first reply take, in minutes, by priority. */
const responseMinutes: Record<TicketPriority, { triage: number; reply: number }> = {
  urgent: { triage: 30, reply: 45 },
  high: { triage: 120, reply: 180 },
  medium: { triage: 300, reply: 480 },
  low: { triage: 720, reply: 1440 },
};

export type HistoryContext = {
  random: Random;
  projectId: string;
  /** Agents and admins of the project. */
  assigneeIds: string[];
  triagerIds: string[];
  requesterFirstName: string;
  firstNameOf: (userId: string) => string;
};

export type GeneratedHistory = {
  history: TicketHistory;
  /** Minutes between the last entry of the history and the seed date. */
  quietMinutes: number;
};

/** Plays out a plausible history for a story: triage, replies, notes, waiting and resolution. */
export function generateHistory(story: TicketStory, context: HistoryContext): GeneratedHistory {
  const { random } = context;
  const finalStatus = random.weighted(finalStatusWeights);
  // Sometimes the customer picked a different priority and triage corrects it.
  const submittedPriority = random.chance(0.12)
    ? nearbyPriority(story.priority, random)
    : story.priority;
  const history = new TicketHistory(submittedPriority);
  const writer = new StoryWriter(history, story, context);

  if (finalStatus === "open") {
    return { history, quietMinutes: writer.playOpenTicket() };
  }
  return { history, quietMinutes: writer.playWorkedTicket(finalStatus) };
}

class StoryWriter {
  readonly #history: TicketHistory;
  readonly #story: TicketStory;
  readonly #context: HistoryContext;
  readonly #random: Random;
  readonly #triagerId: string;
  #assigneeId: string;

  constructor(history: TicketHistory, story: TicketStory, context: HistoryContext) {
    this.#history = history;
    this.#story = story;
    this.#context = context;
    this.#random = context.random;
    this.#triagerId = this.#random.pick(context.triagerIds);
    this.#assigneeId = this.#random.pick(context.assigneeIds);
  }

  /** Returns how long the ticket has been quiet since. */
  playOpenTicket(): number {
    const random = this.#random;
    const stage = random.weighted([
      ["untriaged", 45],
      ["triaged", 30],
      ["acknowledged", 25],
    ] as const);

    if (stage === "untriaged") {
      const longestWait = this.#story.priority === "urgent" ? 180 : 2400;
      return random.integer(10, longestWait);
    }

    this.#triage({ assign: stage === "acknowledged" || random.chance(0.5) });
    if (stage === "acknowledged") {
      this.#history.wait(this.#replyDelay());
      this.#reply(random.pick(acknowledgements));
      if (random.chance(0.3)) {
        this.#customerNudge();
      }
    }
    // Some low-stakes tickets sit in the backlog for weeks, as they do in real queues.
    const canWait = this.#story.priority === "low" || this.#story.priority === "medium";
    if (canWait && random.chance(0.3)) {
      return random.integer(4 * MINUTES_PER_DAY, 35 * MINUTES_PER_DAY);
    }
    return random.integer(30, 4000);
  }

  /** Returns how long the ticket has been quiet since. */
  playWorkedTicket(finalStatus: Exclude<TicketStatus, "open">): number {
    const random = this.#random;
    this.#triage({ assign: true });
    this.#history.wait(this.#replyDelay());
    this.#reply(random.pick(acknowledgements));
    this.#history.changeStatus(this.#assigneeId, "in_progress");

    if (finalStatus === "blocked") {
      this.#investigate();
      this.#askCustomer();
      return random.chance(0.25)
        ? random.integer(6 * MINUTES_PER_DAY, 20 * MINUTES_PER_DAY)
        : random.integer(60, 6 * MINUTES_PER_DAY);
    }

    this.#work();
    if (finalStatus === "in_progress") {
      return random.chance(0.2)
        ? random.integer(3 * MINUTES_PER_DAY, 21 * MINUTES_PER_DAY)
        : random.integer(30, 3 * MINUTES_PER_DAY);
    }

    this.#resolve();
    if (finalStatus === "resolved") {
      const minutesSinceResolved = this.#maybeThanks(0.4);
      return random.integer(30, AUTO_CLOSE_AFTER_MINUTES - minutesSinceResolved - 60);
    }

    this.#close();
    return this.#closedTicketAge();
  }

  #triage({ assign }: { assign: boolean }): void {
    const history = this.#history;
    history.wait(this.#random.integer(3, responseMinutes[this.#story.priority].triage));
    if (history.priority !== this.#story.priority) {
      history.changePriority(this.#triagerId, this.#story.priority);
    }
    if (assign) {
      history.assign(this.#triagerId, this.#assigneeId);
    }
    for (const labelName of this.#story.labels) {
      history.addLabel(this.#triagerId, labelName);
    }
  }

  /** Mostly on time, sometimes (as in real life) far too slow. */
  #replyDelay(): number {
    const usual = this.#random.integer(5, responseMinutes[this.#story.priority].reply);
    return this.#random.chance(0.1) ? usual * 4 : usual;
  }

  /** Investigation, sometimes waiting on the customer, a handover or a nudge. */
  #work(): void {
    const random = this.#random;
    this.#investigate();
    if (random.chance(0.28)) {
      this.#askCustomer();
      this.#history.wait(random.integer(60, 2 * MINUTES_PER_DAY));
      this.#customerSays(random.pick(this.#projectLines(customerAnswers)));
      this.#history.changeStatus(null, "in_progress");
    }
    if (random.chance(0.1)) {
      this.#handOver();
    }
    if (random.chance(0.3)) {
      this.#customerNudge();
      this.#history.wait(random.integer(30, 480));
      this.#reply(random.pick(progressUpdates));
    }
  }

  /** An investigation takes from an hour to a week and a half; the note says what it found. */
  #investigate(): void {
    const random = this.#random;
    this.#history.wait(random.integer(20, 600) + random.integer(0, 10 * MINUTES_PER_DAY));
    if (random.chance(0.75)) {
      this.#note(this.#story.note);
    }
  }

  #askCustomer(): void {
    this.#history.wait(this.#random.integer(30, 600));
    this.#reply(this.#random.pick(this.#projectLines(infoRequests)));
    this.#history.changeStatus(this.#assigneeId, "blocked");
  }

  #customerNudge(): void {
    this.#history.wait(this.#random.integer(MINUTES_PER_DAY, 3 * MINUTES_PER_DAY));
    this.#customerSays(this.#random.pick(customerNudges));
  }

  #handOver(): void {
    const others = this.#context.assigneeIds.filter((id) => id !== this.#assigneeId);
    const nextAssigneeId = this.#random.pick(others);
    this.#history.wait(this.#random.integer(60, MINUTES_PER_DAY));
    const note = this.#random
      .pick(handoverNotes)
      .replaceAll("{teammate}", this.#context.firstNameOf(nextAssigneeId));
    this.#note(note);
    this.#history.assign(this.#assigneeId, nextAssigneeId);
    this.#assigneeId = nextAssigneeId;
  }

  #resolve(): void {
    this.#history.wait(this.#random.integer(120, 4 * MINUTES_PER_DAY));
    this.#reply(this.#story.resolution);
    this.#history.changeStatus(this.#assigneeId, "resolved");
  }

  /** Returns the minutes that passed since the ticket was resolved. */
  #maybeThanks(probability: number): number {
    if (!this.#random.chance(probability)) {
      return 0;
    }
    const minutes = this.#random.integer(10, 720);
    this.#history.wait(minutes);
    this.#customerSays(this.#random.pick(customerThanks));
    return minutes;
  }

  /** The assignee closes it after a thank-you; otherwise Support Desk closes it after 5 days. */
  #close(): void {
    const minutesSinceResolved = this.#maybeThanks(0.5);
    if (minutesSinceResolved > 0) {
      this.#history.wait(this.#random.integer(10, 600));
      this.#history.changeStatus(this.#assigneeId, "closed");
      return;
    }
    this.#history.wait(AUTO_CLOSE_AFTER_MINUTES);
    this.#history.changeStatus(null, "closed");
  }

  /** Closed tickets go back about five months, a few more of them from the last month. */
  #closedTicketAge(): number {
    const random = this.#random;
    if (random.chance(0.4)) {
      return random.integer(60, 30 * MINUTES_PER_DAY);
    }
    return random.integer(30 * MINUTES_PER_DAY, 150 * MINUTES_PER_DAY);
  }

  #reply(text: string): void {
    this.#history.comment("public_reply", this.#assigneeId, this.#personalize(text));
  }

  #note(text: string): void {
    this.#history.comment("internal_note", this.#assigneeId, this.#personalize(text));
  }

  #customerSays(text: string): void {
    this.#history.comment("customer_message", null, text);
  }

  #projectLines(linesByProject: Record<string, string[]>): string[] {
    return linesByProject[this.#context.projectId] ?? [];
  }

  #personalize(text: string): string {
    return text.replaceAll("{name}", this.#context.requesterFirstName);
  }
}

/** The priority one step above or below: what the customer picked before triage. */
function nearbyPriority(priority: TicketPriority, random: Random): TicketPriority {
  const index = ticketPriorities.indexOf(priority);
  const candidates = [ticketPriorities[index - 1], ticketPriorities[index + 1]].filter(
    (candidate) => candidate !== undefined,
  );
  return random.pick(candidates);
}
