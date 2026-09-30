const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 60 * SECONDS_PER_MINUTE;
const SECONDS_PER_DAY = 24 * SECONDS_PER_HOUR;

const relativeUnits: Array<{ unit: Intl.RelativeTimeFormatUnit; seconds: number }> = [
  { unit: "year", seconds: 365 * SECONDS_PER_DAY },
  { unit: "month", seconds: 30 * SECONDS_PER_DAY },
  { unit: "week", seconds: 7 * SECONDS_PER_DAY },
  { unit: "day", seconds: SECONDS_PER_DAY },
  { unit: "hour", seconds: SECONDS_PER_HOUR },
  { unit: "minute", seconds: SECONDS_PER_MINUTE },
];

const relativeTimeFormat = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

const dateTimeFormat = new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" });

const monthYearFormat = new Intl.DateTimeFormat("en", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

/** "just now", "5 minutes ago", "yesterday", "3 weeks ago", ... */
export function formatRelativeTime(isoDate: string, now = new Date()): string {
  const secondsAgo = (now.getTime() - new Date(isoDate).getTime()) / 1000;

  for (const { unit, seconds } of relativeUnits) {
    if (secondsAgo >= seconds) {
      return relativeTimeFormat.format(-Math.floor(secondsAgo / seconds), unit);
    }
  }
  return "just now";
}

/** "Mar 2, 2026, 9:00 AM" */
export function formatDateTime(isoDate: string): string {
  return dateTimeFormat.format(new Date(isoDate));
}

/** "November 2022", for a calendar date such as "2022-11-24". */
export function formatMonthYear(isoDate: string): string {
  return monthYearFormat.format(new Date(isoDate));
}
