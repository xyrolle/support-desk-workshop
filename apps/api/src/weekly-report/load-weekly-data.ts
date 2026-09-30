import { type TicketStatus, ticketRef } from "@support-desk/shared";
import { inArray } from "drizzle-orm";
import { listVisibleProjects } from "../auth/policy.ts";
import type { AppDatabase } from "../db/client.ts";
import { tickets } from "../db/schema.ts";
import { type ProjectWeek, projectWeek, reportInstant } from "../lib/dates.ts";
import { findLabelsOfTickets } from "../modules/labels/labels.repository.ts";
import type { RequestContext } from "../request-context.ts";

export type WeeklyTicket = {
  ref: string;
  title: string;
  status: TicketStatus;
  createdAt: string;
  resolvedAt: string | null;
  firstRespondedAt: string | null;
  labels: string[];
};

export type WeeklyProject = {
  name: string;
  timeZone: string;
  week: ProjectWeek;
  measuredAt: Date;
  tickets: WeeklyTicket[];
};

export type WeeklyReportData = {
  asOf: string;
  projects: WeeklyProject[];
};

/** Projects the current user can see, through the access policy, sorted by name. */
export function loadWeeklyData(context: RequestContext, asOf: string): WeeklyReportData {
  const visible = listVisibleProjects(context);
  const ticketsByProject = loadTickets(context.database, visible);
  return {
    asOf,
    projects: visible.map((project) => {
      const week = projectWeek(asOf, project.timeZone);
      return {
        name: project.name,
        timeZone: project.timeZone,
        week,
        measuredAt: reportInstant(week, context.clock.now()),
        tickets: ticketsByProject.get(project.id) ?? [],
      };
    }),
  };
}

function loadTickets(
  database: AppDatabase,
  visible: { id: string; key: string }[],
): Map<string, WeeklyTicket[]> {
  const byProject = new Map<string, WeeklyTicket[]>(visible.map((project) => [project.id, []]));
  if (visible.length === 0) {
    return byProject;
  }

  const rows = database
    .select({
      id: tickets.id,
      projectId: tickets.projectId,
      number: tickets.number,
      title: tickets.title,
      status: tickets.status,
      createdAt: tickets.createdAt,
      resolvedAt: tickets.resolvedAt,
      firstRespondedAt: tickets.firstRespondedAt,
    })
    .from(tickets)
    .where(
      inArray(
        tickets.projectId,
        visible.map((project) => project.id),
      ),
    )
    .all();

  const labelsByTicket = findLabelsOfTickets(
    database,
    rows.map((row) => row.id),
  );
  const keyById = new Map(visible.map((project) => [project.id, project.key]));

  for (const row of rows) {
    const key = keyById.get(row.projectId);
    const list = byProject.get(row.projectId);
    if (key === undefined || list === undefined) {
      continue;
    }
    list.push({
      ref: ticketRef(key, row.number),
      title: row.title,
      status: row.status,
      createdAt: row.createdAt,
      resolvedAt: row.resolvedAt,
      firstRespondedAt: row.firstRespondedAt,
      labels: (labelsByTicket.get(row.id) ?? []).map((label) => label.name),
    });
  }
  return byProject;
}
