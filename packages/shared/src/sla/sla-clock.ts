import { z } from "zod";
import type { CustomerTier } from "../customers.ts";
import type { TicketPriority, TicketStatus } from "../tickets.ts";
import { type BusinessPause, businessMinutesBetween } from "./business-hours.ts";
import { slaTargetMinutes } from "./sla-targets.ts";

export const slaClockStates = ["met", "breached", "paused", "running"] as const;

export const slaClockStateSchema = z.enum(slaClockStates);

export type SlaClockState = z.infer<typeof slaClockStateSchema>;

export const slaClockSchema = z.object({
  state: slaClockStateSchema,
  targetMinutes: z.number().int().min(0),
  elapsedMinutes: z.number().int().min(0),
});

export type SlaClock = z.infer<typeof slaClockSchema>;

export const ticketSlaSchema = z.object({
  measuredAt: z.iso.datetime(),
  firstResponse: slaClockSchema,
  resolution: slaClockSchema,
});

export type TicketSla = z.infer<typeof ticketSlaSchema>;

/** A status the ticket moved to, from the activity log. It starts out open. */
export type StatusChange = {
  at: Date;
  to: TicketStatus;
};

export type MeasureTicketSlaInput = {
  createdAt: Date;
  firstRespondedAt: Date | null;
  resolvedAt: Date | null;
  status: TicketStatus;
  priority: TicketPriority;
  tier: CustomerTier;
  timeZone: string;
  now: Date;
  statusChanges: readonly StatusChange[];
};

/** An unresolved ticket is at risk with this many business minutes left, or fewer. */
export const AT_RISK_MINUTES = 120;

/**
 * Both clocks, measured at `now`. They pause while the ticket is blocked.
 * The first-response clock stops at the first reply, or at resolution when
 * nobody replied.
 */
export function measureTicketSla(input: MeasureTicketSlaInput): TicketSla {
  const targets = slaTargetMinutes(input.priority, input.tier);
  const pauses = blockedPauses(input.createdAt, input.statusChanges, input.now);
  return {
    measuredAt: input.now.toISOString(),
    firstResponse: measureClock(
      input,
      input.firstRespondedAt ?? input.resolvedAt,
      targets.firstResponseMinutes,
      pauses,
    ),
    resolution: measureClock(input, input.resolvedAt, targets.resolutionMinutes, pauses),
  };
}

/**
 * The clock a list row shows: first response until the first reply, then
 * resolution. Resolved tickets have nothing left to count down.
 */
export function listedSlaClock(ticket: {
  status: TicketStatus;
  firstRespondedAt: string | null;
  sla: TicketSla;
}): SlaClock | null {
  if (ticket.status === "resolved" || ticket.status === "closed") {
    return null;
  }
  return ticket.firstRespondedAt ? ticket.sla.resolution : ticket.sla.firstResponse;
}

/**
 * Unresolved, not waiting on the customer, and the clock that matters is
 * breached or has at most {@link AT_RISK_MINUTES} business minutes left.
 */
export function isAtRisk(ticket: {
  status: TicketStatus;
  firstRespondedAt: string | null;
  sla: Pick<TicketSla, "firstResponse" | "resolution">;
}): boolean {
  if (ticket.status === "blocked" || ticket.status === "resolved" || ticket.status === "closed") {
    return false;
  }
  const clock = ticket.firstRespondedAt ? ticket.sla.resolution : ticket.sla.firstResponse;
  return clock.targetMinutes - clock.elapsedMinutes <= AT_RISK_MINUTES;
}

/**
 * A running clock keeps counting after it was measured. Paused, met and
 * already-breached clocks stay as they were.
 */
export function advanceRunningClock(
  clock: SlaClock,
  measuredAt: Date,
  now: Date,
  timeZone: string,
): SlaClock {
  if (clock.state !== "running") {
    return clock;
  }
  const elapsedMinutes = clock.elapsedMinutes + businessMinutesBetween(measuredAt, now, timeZone);
  if (elapsedMinutes > clock.targetMinutes) {
    return { ...clock, state: "breached", elapsedMinutes };
  }
  return { ...clock, elapsedMinutes };
}

function measureClock(
  input: MeasureTicketSlaInput,
  stop: Date | null,
  targetMinutes: number,
  pauses: readonly BusinessPause[],
): SlaClock {
  const stopped = stop !== null;
  const elapsedMinutes = businessMinutesBetween(
    input.createdAt,
    stop ?? input.now,
    input.timeZone,
    pauses,
  );
  return {
    state: clockState(elapsedMinutes, targetMinutes, stopped, input.status),
    targetMinutes,
    elapsedMinutes,
  };
}

function clockState(
  elapsedMinutes: number,
  targetMinutes: number,
  stopped: boolean,
  status: TicketStatus,
): SlaClockState {
  if (stopped && elapsedMinutes <= targetMinutes) {
    return "met";
  }
  if (elapsedMinutes > targetMinutes) {
    return "breached";
  }
  if (status === "blocked") {
    return "paused";
  }
  return "running";
}

/** Periods the ticket spent blocked, from the activity log. They do not overlap. */
function blockedPauses(
  createdAt: Date,
  changes: readonly StatusChange[],
  until: Date,
): BusinessPause[] {
  const pauses: BusinessPause[] = [];
  let status: TicketStatus = "open";
  let since = createdAt;
  const ordered = [...changes].sort((left, right) => left.at.getTime() - right.at.getTime());

  for (const change of ordered) {
    if (change.at.getTime() < since.getTime()) {
      continue;
    }
    if (status === "blocked") {
      pauses.push({ start: since, end: change.at });
    }
    status = change.to;
    since = change.at;
  }

  if (status === "blocked" && until.getTime() > since.getTime()) {
    pauses.push({ start: since, end: until });
  }
  return pauses;
}
