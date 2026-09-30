// Wall-clock dates belong to a time zone. They come from Intl, never from
// Date's local-time methods, and the current time is always passed in.

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

/** A civil date and time, with no time zone of its own. */
export type ZonedTime = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
};

const partsFormats = new Map<string, Intl.DateTimeFormat>();
const offsetFormats = new Map<string, Intl.DateTimeFormat>();

export function zonedParts(date: Date, timeZone: string): ZonedParts {
  const parts = format(partsFormats, timeZone, false).formatToParts(date);
  const year = numberPart(parts, "year");
  const month = numberPart(parts, "month");
  const day = numberPart(parts, "day");
  return {
    year,
    month,
    day,
    hour: clockHour(numberPart(parts, "hour")),
    minute: numberPart(parts, "minute"),
    weekday: isoWeekday(year, month, day),
  };
}

/**
 * The instant at which this wall-clock time happens in `timeZone`.
 * Business hours never fall in a daylight-saving gap or overlap.
 */
export function instantFromZonedTime(time: ZonedTime, timeZone: string): Date {
  const guess = Date.UTC(time.year, time.month - 1, time.day, time.hour, time.minute);
  const offset = timeZoneOffset(new Date(guess), timeZone);
  let utc = guess - offset;
  const corrected = timeZoneOffset(new Date(utc), timeZone);
  if (corrected !== offset) {
    utc = guess - corrected;
  }
  return new Date(utc);
}

/** How far ahead of UTC the time zone is at `instant`, in milliseconds. */
function timeZoneOffset(instant: Date, timeZone: string): number {
  const parts = format(offsetFormats, timeZone, true).formatToParts(instant);
  const wallAsUtc = Date.UTC(
    numberPart(parts, "year"),
    numberPart(parts, "month") - 1,
    numberPart(parts, "day"),
    clockHour(numberPart(parts, "hour")),
    numberPart(parts, "minute"),
    numberPart(parts, "second"),
  );
  return wallAsUtc - instant.getTime();
}

function format(
  cache: Map<string, Intl.DateTimeFormat>,
  timeZone: string,
  withSeconds: boolean,
): Intl.DateTimeFormat {
  let formatter = cache.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hourCycle: "h23",
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: withSeconds ? "numeric" : undefined,
    });
    cache.set(timeZone, formatter);
  }
  return formatter;
}

function numberPart(parts: Intl.DateTimeFormatPart[], type: Intl.DateTimeFormatPartTypes): number {
  return Number(parts.find((part) => part.type === type)?.value);
}

/** `hourCycle: "h23"` can report midnight as 24. */
function clockHour(hour: number): number {
  return hour === 24 ? 0 : hour;
}

/** 1 is Monday, 7 is Sunday. Sakamoto's method, so this needs no Date. */
function isoWeekday(year: number, month: number, day: number): number {
  const offsets = [0, 3, 2, 5, 0, 3, 5, 1, 4, 6, 2, 4];
  let yearNumber = year;
  if (month < 3) {
    yearNumber -= 1;
  }
  const monthOffset = offsets[month - 1] ?? 0;
  const sundayBased =
    (yearNumber +
      Math.floor(yearNumber / 4) -
      Math.floor(yearNumber / 100) +
      Math.floor(yearNumber / 400) +
      monthOffset +
      day) %
    7;
  return sundayBased === 0 ? 7 : sundayBased;
}
