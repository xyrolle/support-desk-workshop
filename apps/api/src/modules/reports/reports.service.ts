/*
 * LEGACY: the ticket volume report, written before the API moved to Drizzle.
 * It runs hand-written SQL on the raw better-sqlite3 connection, casts rows
 * instead of validating them, and uses its own UTC date helpers. The ops
 * team's spreadsheet imports this JSON, so its snake_case shape must stay.
 * It works and it is tested, so we leave it alone. Do not copy these patterns:
 * new code uses Drizzle, the shared zod schemas and lib/dates.ts (AGENTS.md).
 */
import type { AppDatabase } from "../../db/client.ts";
import { formatTicketRef } from "../../lib/format-ticket-ref.ts";
import { addDays, ageInDays, eachDay, formatDay } from "./legacy-dates.ts";

const OPENED_PER_DAY_SQL = `
  SELECT substr(created_at, 1, 10) AS day, count(*) AS total
  FROM tickets
  WHERE project_id = ? AND created_at >= ? AND created_at < ?
  GROUP BY day`;

const RESOLVED_PER_DAY_SQL = `
  SELECT substr(resolved_at, 1, 10) AS day, count(*) AS total
  FROM tickets
  WHERE project_id = ? AND resolved_at >= ? AND resolved_at < ?
  GROUP BY day`;

const AVERAGE_HOURS_SQL = `
  SELECT
    avg((julianday(first_responded_at) - julianday(created_at)) * 24) AS first_response,
    avg((julianday(resolved_at) - julianday(created_at)) * 24) AS resolution
  FROM tickets
  WHERE project_id = ? AND created_at >= ? AND created_at < ?`;

const BACKLOG_SQL = `
  SELECT status, count(*) AS total
  FROM tickets
  WHERE project_id = ? AND status IN ('open', 'in_progress', 'blocked')
  GROUP BY status`;

const OLDEST_OPEN_SQL = `
  SELECT p.key AS project_key, t.number, t.title, t.created_at
  FROM tickets t
  JOIN projects p ON p.id = t.project_id
  WHERE t.project_id = ? AND t.status IN ('open', 'in_progress', 'blocked')
  ORDER BY t.created_at ASC
  LIMIT 5`;

type DayRow = { day: string; total: number };
type AverageRow = { first_response: number | null; resolution: number | null };
type BacklogRow = { status: string; total: number };
type OldestOpenRow = { project_key: string; number: number; title: string; created_at: string };

export type VolumeReport = {
  project_id: string;
  from: string;
  to: string;
  days: Array<{ day: string; opened: number; resolved: number }>;
  totals: { opened: number; resolved: number };
  avg_first_response_hours: number | null;
  avg_resolution_hours: number | null;
  backlog: Record<string, number>;
  oldest_open: Array<{ ref: string; title: string; age_days: number }>;
};

/**
 * Tickets opened and resolved per UTC day from `from` to `to` (both included),
 * plus the backlog and the oldest open tickets as they are right now.
 */
export function buildVolumeReport(
  database: AppDatabase,
  projectId: string,
  from: Date,
  to: Date,
): VolumeReport {
  const sqlite = database.$client;
  const start = from.toISOString();
  const end = addDays(to, 1).toISOString();

  const opened = sqlite.prepare(OPENED_PER_DAY_SQL).all(projectId, start, end) as DayRow[];
  const resolved = sqlite.prepare(RESOLVED_PER_DAY_SQL).all(projectId, start, end) as DayRow[];
  const averages = sqlite.prepare(AVERAGE_HOURS_SQL).get(projectId, start, end) as AverageRow;
  const backlog = sqlite.prepare(BACKLOG_SQL).all(projectId) as BacklogRow[];
  const oldest = sqlite.prepare(OLDEST_OPEN_SQL).all(projectId) as OldestOpenRow[];

  const days = eachDay(from, to).map((day) => ({
    day,
    opened: totalFor(opened, day),
    resolved: totalFor(resolved, day),
  }));

  const report: VolumeReport = {
    project_id: projectId,
    from: formatDay(from),
    to: formatDay(to),
    days,
    totals: { opened: 0, resolved: 0 },
    avg_first_response_hours: roundHours(averages.first_response),
    avg_resolution_hours: roundHours(averages.resolution),
    backlog: { open: 0, in_progress: 0, blocked: 0 },
    oldest_open: [],
  };
  for (const day of days) {
    report.totals.opened += day.opened;
    report.totals.resolved += day.resolved;
  }
  for (const row of backlog) {
    report.backlog[row.status] = row.total;
  }
  for (const row of oldest) {
    report.oldest_open.push({
      ref: formatTicketRef(row),
      title: row.title,
      age_days: ageInDays(row.created_at, new Date()),
    });
  }
  return report;
}

function totalFor(rows: DayRow[], day: string): number {
  const row = rows.find((candidate) => candidate.day === day);
  return row ? row.total : 0;
}

function roundHours(hours: number | null): number | null {
  return hours === null ? null : Math.round(hours * 10) / 10;
}
