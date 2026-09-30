/*
 * LEGACY date helpers, used only by the reports module. They count whole UTC
 * days and ignore the project's time zone, which is why new code must not use
 * them: use lib/dates.ts instead (see AGENTS.md).
 */

const MS_PER_DAY = 86400000;

/** Parses "2026-09-01" to midnight UTC, or returns null if it is not a real date. */
export function parseDay(value: string | undefined): Date | null {
  if (value?.length !== 10) {
    return null;
  }
  const [year, month, day] = value.split("-").map(Number);
  if (year === undefined || month === undefined || day === undefined) {
    return null;
  }
  const date = new Date(Date.UTC(year, month - 1, day));
  if (Number.isNaN(date.getTime()) || formatDay(date) !== value) {
    return null;
  }
  return date;
}

/** Formats the UTC day of a date as "2026-09-01". */
export function formatDay(date: Date): string {
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${date.getUTCFullYear()}-${month}-${day}`;
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * MS_PER_DAY);
}

export function daysBetween(start: Date, end: Date): number {
  return Math.round((end.getTime() - start.getTime()) / MS_PER_DAY);
}

/** Every day from `from` to `to`, both included, as "2026-09-01" strings. */
export function eachDay(from: Date, to: Date): string[] {
  const days: string[] = [];
  for (let day = from; day <= to; day = addDays(day, 1)) {
    days.push(formatDay(day));
  }
  return days;
}

/** Midnight UTC today. */
export function today(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

/** Whole days between an ISO timestamp and a date. */
export function ageInDays(timestamp: string, asOf: Date): number {
  return Math.floor((asOf.getTime() - Date.parse(timestamp)) / MS_PER_DAY);
}
