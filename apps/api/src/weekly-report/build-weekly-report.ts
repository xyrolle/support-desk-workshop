import { type TicketStatus, unresolvedStatuses } from "@support-desk/shared";
import { type ProjectWeek, type ZonedParts, zonedParts } from "../lib/dates.ts";
import type { WeeklyProject, WeeklyReportData, WeeklyTicket } from "./load-weekly-data.ts";

const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/** Markdown for one weekly report. Pure: the data already carries every fact. */
export function buildWeeklyReport(data: WeeklyReportData): string {
  if (data.projects.length === 0) {
    return "";
  }
  return `${data.projects.map((project) => section(project, data.asOf)).join("\n\n")}\n`;
}

function section(project: WeeklyProject, asOf: string): string {
  const lines = [`## ${project.name}`, "", weekHeading(project, asOf), "", ...statLines(project)];
  const oldest = oldestUnresolved(project);
  if (oldest.length > 0) {
    lines.push(
      "",
      "Oldest open tickets:",
      "",
      ...oldest.map((ticket) => oldestLine(ticket, project)),
    );
  }
  return lines.join("\n");
}

function weekHeading(project: WeeklyProject, asOf: string): string {
  const first = zonedParts(project.week.start, project.timeZone);
  const last = calendarDay(asOf);
  const lastWeekday = ((first.weekday - 1 + 6) % 7) + 1;
  const crossesMonth = first.month !== last.month || first.year !== last.year;
  const start = civilDate(first, crossesMonth, first.year !== last.year);
  const end = civilDate({ ...last, weekday: lastWeekday, hour: 0, minute: 0 }, true, true);
  return `${start} to ${end}, ${project.timeZone}`;
}

function calendarDay(asOf: string): { year: number; month: number; day: number } {
  const [year, month, day] = asOf.split("-").map(Number);
  return { year: year ?? 0, month: month ?? 0, day: day ?? 0 };
}

function civilDate(parts: ZonedParts, withMonth: boolean, withYear: boolean): string {
  const weekday = weekdays[parts.weekday - 1];
  const words = [weekday, String(parts.day)];
  if (withMonth) {
    words.push(months[parts.month - 1] ?? "");
  }
  if (withYear) {
    words.push(String(parts.year));
  }
  return words.join(" ");
}

const MILLISECONDS_PER_MINUTE = 60_000;
const MILLISECONDS_PER_DAY = 86_400_000;

function statLines(project: WeeklyProject): string[] {
  const opened = project.tickets.filter((ticket) => inWeek(ticket.createdAt, project.week));
  const resolved = project.tickets.filter((ticket) => inWeek(ticket.resolvedAt, project.week));
  if (opened.length === 0) {
    const lines = ["No tickets opened this week."];
    if (resolved.length > 0) {
      lines.push(`- Resolved ${resolved.length}`);
    }
    return lines;
  }
  const lines = [`- Opened ${opened.length} · Resolved ${resolved.length}`];
  const median = medianFirstResponse(opened);
  if (median) {
    const duration = formatDuration(median.minutes);
    lines.push(`- Median first response: ${duration} (${countLabel(median.count)})`);
  }
  const labels = topLabels(opened);
  if (labels.length > 0) {
    const list = labels.map((label) => `${label.name} (${label.count})`).join(", ");
    lines.push(`- Top labels: ${list}`);
  }
  return lines;
}

function inWeek(iso: string | null, week: ProjectWeek): boolean {
  if (iso === null) {
    return false;
  }
  const time = Date.parse(iso);
  return time >= week.start.getTime() && time < week.end.getTime();
}

function medianFirstResponse(
  opened: WeeklyTicket[],
): { minutes: number; count: number } | undefined {
  const durations = opened.flatMap((ticket) => {
    const duration = responseMilliseconds(ticket);
    return duration === undefined ? [] : [duration];
  });
  if (durations.length === 0) {
    return undefined;
  }
  durations.sort((left, right) => left - right);
  const mid = Math.floor(durations.length / 2);
  const later = durations[mid] ?? 0;
  const earlier = durations[mid - 1] ?? later;
  const medianMs = durations.length % 2 === 1 ? later : (earlier + later) / 2;
  return { minutes: Math.floor(medianMs / MILLISECONDS_PER_MINUTE), count: durations.length };
}

function responseMilliseconds(ticket: WeeklyTicket): number | undefined {
  if (ticket.firstRespondedAt === null) {
    return undefined;
  }
  return Date.parse(ticket.firstRespondedAt) - Date.parse(ticket.createdAt);
}

function formatDuration(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) {
    return `${minutes}m`;
  }
  return `${hours}h ${minutes}m`;
}

function countLabel(count: number): string {
  return count === 1 ? "1 ticket" : `${count} tickets`;
}

function topLabels(opened: WeeklyTicket[]): { name: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const ticket of opened) {
    for (const label of ticket.labels) {
      counts.set(label, (counts.get(label) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .slice(0, 3)
    .map(([name, count]) => ({ name, count }));
}

function oldestUnresolved(project: WeeklyProject): WeeklyTicket[] {
  const measured = project.measuredAt.getTime();
  return project.tickets
    .filter((ticket) => isUnresolved(ticket.status) && Date.parse(ticket.createdAt) <= measured)
    .sort(
      (left, right) =>
        left.createdAt.localeCompare(right.createdAt) || left.ref.localeCompare(right.ref),
    )
    .slice(0, 5);
}

function isUnresolved(status: TicketStatus): boolean {
  return unresolvedStatuses.some((unresolved) => unresolved === status);
}

function oldestLine(ticket: WeeklyTicket, project: WeeklyProject): string {
  const days = Math.floor(
    (project.measuredAt.getTime() - Date.parse(ticket.createdAt)) / MILLISECONDS_PER_DAY,
  );
  const age = days === 1 ? "1 day" : `${days} days`;
  return `- ${ticket.ref} · ${age} · ${oneLine(ticket.title)}`;
}

/** Titles are customer text. A newline or a line starting with "-" would break the list. */
function oneLine(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}
