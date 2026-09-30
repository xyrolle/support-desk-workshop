import { instantFromZonedTime, type ZonedTime, zonedParts } from "./zoned-time.ts";

export { instantFromZonedTime } from "./zoned-time.ts";

const MILLISECONDS_PER_MINUTE = 60_000;
const MILLISECONDS_PER_DAY = 86_400_000;
const OPENING_HOUR = 9;
const CLOSING_HOUR = 18;

type CalendarDay = Pick<ZonedTime, "year" | "month" | "day">;

/** A stretch of time that does not count, such as waiting on the customer. */
export type BusinessPause = {
  start: Date;
  end: Date;
};

/**
 * Business minutes from `start` to `end` in `timeZone`: Monday to Friday,
 * 09:00 to 18:00. The weekend and the night do not count. `pauses` are
 * subtracted in business minutes too.
 */
export function businessMinutesBetween(
  start: Date,
  end: Date,
  timeZone: string,
  pauses: readonly BusinessPause[] = [],
): number {
  const total = minutesInRange(start, end, timeZone);
  const paused = pauses.reduce((sum, pause) => {
    return sum + minutesInRange(later(start, pause.start), earlier(end, pause.end), timeZone);
  }, 0);
  return total - paused;
}

function minutesInRange(start: Date, end: Date, timeZone: string): number {
  if (end.getTime() <= start.getTime()) {
    return 0;
  }

  const first = zonedParts(start, timeZone);
  const last = zonedParts(end, timeZone);
  let day: CalendarDay = { year: first.year, month: first.month, day: first.day };
  const lastKey = dayKey(last);
  let total = 0;

  for (;;) {
    total += minutesOnDay(day, start, end, timeZone);
    if (dayKey(day) === lastKey) {
      return total;
    }
    day = nextDay(day);
  }
}

/** The overlap of [start, end] with this day's 09:00–18:00, or 0 on a weekend. */
function minutesOnDay(day: CalendarDay, start: Date, end: Date, timeZone: string): number {
  const noon = instantFromZonedTime({ ...day, hour: 12, minute: 0 }, timeZone);
  if (zonedParts(noon, timeZone).weekday > 5) {
    return 0;
  }

  const open = instantFromZonedTime({ ...day, hour: OPENING_HOUR, minute: 0 }, timeZone);
  const close = instantFromZonedTime({ ...day, hour: CLOSING_HOUR, minute: 0 }, timeZone);
  const from = later(start, open);
  const to = earlier(end, close);
  if (to.getTime() <= from.getTime()) {
    return 0;
  }
  return Math.round((to.getTime() - from.getTime()) / MILLISECONDS_PER_MINUTE);
}

function nextDay(day: CalendarDay): CalendarDay {
  const utc = new Date(Date.UTC(day.year, day.month - 1, day.day) + MILLISECONDS_PER_DAY);
  return { year: utc.getUTCFullYear(), month: utc.getUTCMonth() + 1, day: utc.getUTCDate() };
}

function dayKey(day: CalendarDay): number {
  return day.year * 10_000 + day.month * 100 + day.day;
}

function later(left: Date, right: Date): Date {
  return left.getTime() >= right.getTime() ? left : right;
}

function earlier(left: Date, right: Date): Date {
  return left.getTime() <= right.getTime() ? left : right;
}
