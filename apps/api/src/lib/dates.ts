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

/** The wall-clock date and time of an instant in a time zone. */
export type ZonedParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  /** 1 is Monday, 7 is Sunday. */
  weekday: number;
};

const formatsByTimeZone = new Map<string, Intl.DateTimeFormat>();

export function zonedParts(date: Date, timeZone: string): ZonedParts {
  const parts = partsFormat(timeZone).formatToParts(date);
  const numberPart = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value);

  const year = numberPart("year");
  const month = numberPart("month");
  const day = numberPart("day");
  const dayOfWeek = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  return {
    year,
    month,
    day,
    hour: numberPart("hour"),
    minute: numberPart("minute"),
    weekday: dayOfWeek === 0 ? 7 : dayOfWeek,
  };
}

function partsFormat(timeZone: string): Intl.DateTimeFormat {
  let format = formatsByTimeZone.get(timeZone);
  if (!format) {
    format = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hourCycle: "h23",
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    });
    formatsByTimeZone.set(timeZone, format);
  }
  return format;
}
