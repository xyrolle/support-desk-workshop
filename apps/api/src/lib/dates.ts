// Dates in Support Desk are instants stored as UTC ISO strings. Anything
// calendar-based (days, weeks, business hours) belongs to a project's time
// zone and is computed here with Intl, never with Date's local-time methods.

/** Where the API gets the current time, so tests can fix it. */
export type Clock = {
  now: () => Date;
};

export const systemClock: Clock = {
  now: () => new Date(),
};

const MILLISECONDS_PER_MINUTE = 60_000;

export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * MILLISECONDS_PER_MINUTE);
}

/** The calendar date of an instant in UTC, as YYYY-MM-DD. */
export function utcDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export { type ZonedParts, zonedParts } from "@support-desk/shared";
