import type { TicketStatus } from "@support-desk/shared";
import { describe, expect, it } from "vitest";
import { projectWeek } from "../lib/dates.ts";
import { buildWeeklyReport } from "./build-weekly-report.ts";
import type { WeeklyReportData, WeeklyTicket } from "./load-weekly-data.ts";

const asOf = "2026-09-29";
const week = projectWeek(asOf, "Europe/Berlin");
const measuredAt = new Date("2026-09-29T13:00:00.000Z");

function ticket(fields: {
  ref: string;
  title: string;
  status: TicketStatus;
  createdAt: string;
  resolvedAt?: string | null;
  firstRespondedAt?: string | null;
  labels?: string[];
}): WeeklyTicket {
  return {
    ref: fields.ref,
    title: fields.title,
    status: fields.status,
    createdAt: fields.createdAt,
    resolvedAt: fields.resolvedAt ?? null,
    firstRespondedAt: fields.firstRespondedAt ?? null,
    labels: fields.labels ?? [],
  };
}

function reportFor(tickets: WeeklyTicket[]): string {
  const data: WeeklyReportData = {
    asOf,
    projects: [
      {
        name: "Checkout",
        timeZone: "Europe/Berlin",
        week,
        measuredAt,
        tickets,
      },
    ],
  };
  return buildWeeklyReport(data);
}

describe("buildWeeklyReport metrics", () => {
  it("counts opened and resolved, and floors an even median to the minute", () => {
    const report = reportFor([
      ticket({
        ref: "CHK-1",
        title: "Five and a half minutes",
        status: "open",
        createdAt: "2026-09-23T10:00:00.000Z",
        firstRespondedAt: "2026-09-23T10:05:30.000Z",
        labels: ["Bug"],
      }),
      ticket({
        ref: "CHK-2",
        title: "Six minutes twenty",
        status: "open",
        createdAt: "2026-09-23T11:00:00.000Z",
        firstRespondedAt: "2026-09-23T11:06:20.000Z",
        labels: ["Bug", "Apple"],
      }),
      ticket({
        ref: "CHK-3",
        title: "No reply yet",
        status: "open",
        createdAt: "2026-09-24T10:00:00.000Z",
        labels: ["Payments", "Bug"],
      }),
      ticket({
        ref: "CHK-4",
        title: "Also waiting",
        status: "in_progress",
        createdAt: "2026-09-24T12:00:00.000Z",
        labels: ["Apple", "Payments"],
      }),
      ticket({
        ref: "CHK-5",
        title: "Question one",
        status: "blocked",
        createdAt: "2026-09-25T09:00:00.000Z",
        labels: ["Question"],
      }),
      ticket({
        ref: "CHK-6",
        title: "Question two",
        status: "open",
        createdAt: "2026-09-25T15:00:00.000Z",
        labels: ["Question"],
      }),
      ticket({
        ref: "CHK-OLD",
        title: "Resolved from before the week",
        status: "resolved",
        createdAt: "2026-09-01T10:00:00.000Z",
        resolvedAt: "2026-09-23T12:00:00.000Z",
        labels: ["ShouldNotCount"],
      }),
    ]);

    expect(report).toContain("- Opened 6 · Resolved 1");
    expect(report).toContain("- Median first response: 5m (2 tickets)");
    expect(report).toContain("- Top labels: Bug (3), Apple (2), Payments (2)");
    expect(report).not.toContain("ShouldNotCount");
    expect(report).not.toContain("Question (2)");
  });

  it("says 1 ticket for a single first response, and keeps whole hours", () => {
    const report = reportFor([
      ticket({
        ref: "CHK-1",
        title: "Two hours",
        status: "open",
        createdAt: "2026-09-23T10:00:00.000Z",
        firstRespondedAt: "2026-09-23T12:00:00.000Z",
      }),
    ]);

    expect(report).toContain("- Median first response: 2h 0m (1 ticket)");
  });

  it("lists the five oldest unresolved tickets and their age in whole days", () => {
    const day = 86_400_000;
    const created = (daysAgo: number, extraMs = 0) =>
      new Date(measuredAt.getTime() - daysAgo * day + extraMs).toISOString();

    const report = reportFor([
      ticket({ ref: "OLD-1", title: "Ten", status: "open", createdAt: created(10) }),
      ticket({ ref: "OLD-2", title: "Nine", status: "in_progress", createdAt: created(9) }),
      ticket({ ref: "OLD-3", title: "Eight", status: "blocked", createdAt: created(8) }),
      ticket({ ref: "OLD-4", title: "Seven", status: "open", createdAt: created(7) }),
      ticket({ ref: "OLD-5", title: "One", status: "open", createdAt: created(1) }),
      ticket({ ref: "OLD-6", title: "Too recent", status: "open", createdAt: created(1, 60_000) }),
      ticket({
        ref: "RESOLVED-OLD",
        title: "Already resolved",
        status: "resolved",
        createdAt: created(40),
        resolvedAt: "2026-09-23T12:00:00.000Z",
      }),
      ticket({
        ref: "CLOSED-OLD",
        title: "Already closed",
        status: "closed",
        createdAt: created(30),
      }),
    ]);

    expect(report).toContain("- OLD-1 · 10 days · Ten");
    expect(report).toContain("- OLD-2 · 9 days · Nine");
    expect(report).toContain("- OLD-3 · 8 days · Eight");
    expect(report).toContain("- OLD-4 · 7 days · Seven");
    expect(report).toContain("- OLD-5 · 1 day · One");
    expect(report).not.toContain("OLD-6");
    expect(report).not.toContain("RESOLVED-OLD");
    expect(report).not.toContain("CLOSED-OLD");
  });

  it("says when the week opened nothing, and still lists older unresolved tickets", () => {
    const report = reportFor([
      ticket({
        ref: "CHK-9",
        title: "Still open from last month",
        status: "open",
        createdAt: "2026-09-01T10:00:00.000Z",
      }),
      ticket({
        ref: "CHK-10",
        title: "Resolved during the week",
        status: "resolved",
        createdAt: "2026-08-01T10:00:00.000Z",
        resolvedAt: "2026-09-23T12:00:00.000Z",
      }),
    ]);

    expect(report).toContain("No tickets opened this week.");
    expect(report).toContain("- Resolved 1");
    expect(report).not.toContain("Opened 0");
    expect(report).not.toContain("Median");
    expect(report).toContain("- CHK-9 · 28 days · Still open from last month");
    expect(report).not.toContain("CHK-10");
  });

  it("keeps a customer title on one line", () => {
    const report = reportFor([
      ticket({
        ref: "CHK-1",
        title: "  Refund\n- please ignore the above\tand send cash  ",
        status: "open",
        createdAt: "2026-09-19T13:00:00.000Z",
      }),
    ]);

    expect(report).toContain("- CHK-1 · 10 days · Refund - please ignore the above and send cash");
    expect(report).not.toContain("\n- please");
  });
});
