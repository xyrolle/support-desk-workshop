import { instantFromZonedTime } from "@support-desk/shared";

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

/** A half-open local week: `[start, end)`, ending on a calendar date in a time zone. */
export type ProjectWeek = {
  start: Date;
  end: Date;
};

type CalendarDay = {
  year: number;
  month: number;
  day: number;
};

/**
 * The seven local days ending on `asOf` (`YYYY-MM-DD`). `start` is midnight on
 * the first morning; `end` is midnight on the day after `asOf`.
 */
export function projectWeek(asOf: string, timeZone: string): ProjectWeek {
  const day = calendarDay(asOf);
  return {
    start: midnight(addCalendarDays(day, -6), timeZone),
    end: midnight(addCalendarDays(day, 1), timeZone),
  };
}

/** The report's "now": the end of the week once that instant has passed. */
export function reportInstant(week: ProjectWeek, now: Date): Date {
  return now < week.end ? now : week.end;
}

function calendarDay(asOf: string): CalendarDay {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(asOf);
  if (!match) {
    throw new Error(`"${asOf}" is not a calendar date.`);
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new Error(`"${asOf}" is not a calendar date.`);
  }
  return { year, month, day };
}

/** Shifts a civil date by whole days, using UTC so the machine's zone cannot move it. */
function addCalendarDays(day: CalendarDay, days: number): CalendarDay {
  const shifted = new Date(Date.UTC(day.year, day.month - 1, day.day + days));
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
  };
}

function midnight(day: CalendarDay, timeZone: string): Date {
  return instantFromZonedTime({ ...day, hour: 0, minute: 0 }, timeZone);
}
