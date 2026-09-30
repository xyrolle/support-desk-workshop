import {
  type CustomerTier,
  isResolvedStatus,
  type TicketPriority,
  type TicketStatus,
  ticketPrioritySchema,
  ticketStatusSchema,
} from "@support-desk/shared";
import { count, eq } from "drizzle-orm";
import { beforeAll, describe, expect, it } from "vitest";
import { createTestDatabase, TEST_NOW } from "../test/test-app.ts";
import type { AppDatabase } from "./client.ts";
import {
  comments,
  contacts,
  organizations,
  projectMembers,
  type TicketEventRow,
  type TicketRow,
  ticketEvents,
  ticketLabels,
  tickets,
  users,
} from "./schema.ts";
import { buildSeedData, type SeedData } from "./seed/build-seed-data.ts";
import { SEED_DATE, seedDataFor } from "./seed/seed-date.ts";
import { seedDatabase } from "./seed.ts";

let database: AppDatabase;

beforeAll(() => {
  database = createTestDatabase();
});

function allTickets(): TicketRow[] {
  return database.select().from(tickets).all();
}

function groupByTicket<Row extends { ticketId: string }>(rows: Row[]): Map<string, Row[]> {
  const groups = new Map<string, Row[]>();
  for (const row of rows) {
    groups.set(row.ticketId, [...(groups.get(row.ticketId) ?? []), row]);
  }
  return groups;
}

describe("seedDatabase", () => {
  it("creates the demo workspace", () => {
    const counts = {
      teammates: database.select({ total: count() }).from(users).get()?.total,
      organizations: database.select({ total: count() }).from(organizations).get()?.total,
      tickets: database.select({ total: count() }).from(tickets).get()?.total,
    };

    expect(counts).toEqual({ teammates: 12, organizations: 40, tickets: 350 });
  });

  it("spreads the tickets over the four projects", () => {
    const perProject = Object.groupBy(allTickets(), (ticket) => ticket.projectId);

    expect({
      checkout: perProject.checkout?.length,
      "mobile-app": perProject["mobile-app"]?.length,
      "internal-tools": perProject["internal-tools"]?.length,
      billing: perProject.billing?.length,
    }).toEqual({ checkout: 105, "mobile-app": 95, "internal-tools": 70, billing: 80 });
  });

  it("numbers each project's tickets in the order they were opened", () => {
    for (const projectTickets of Object.values(
      Object.groupBy(allTickets(), (ticket) => ticket.projectId),
    )) {
      const byNumber = (projectTickets ?? []).toSorted((a, b) => a.number - b.number);
      const openedTimes = byNumber.map((ticket) => ticket.createdAt);
      expect(openedTimes).toEqual(openedTimes.toSorted());
      expect(byNumber[0]?.number).toBe(101);
    }
  });

  it("only assigns unresolved tickets to agents and admins of the ticket's project", () => {
    const memberships = database.select().from(projectMembers).all();

    for (const ticket of allTickets()) {
      if (ticket.assigneeId && !isResolvedStatus(ticket.status)) {
        const membership = memberships.find(
          (member) => member.projectId === ticket.projectId && member.userId === ticket.assigneeId,
        );
        expect(["agent", "admin"], ticket.id).toContain(membership?.role);
      }
    }
  });

  it("records every change, so the activity replays to each ticket's current state", () => {
    const eventsByTicket = groupByTicket(
      database.select().from(ticketEvents).orderBy(ticketEvents.id).all(),
    );
    const labelsByTicket = groupByTicket(database.select().from(ticketLabels).all());

    for (const ticket of allTickets()) {
      const replayed = replay(eventsByTicket.get(ticket.id) ?? [], ticket.priority);
      const labelIds = (labelsByTicket.get(ticket.id) ?? []).map((label) => label.labelId);
      expect(replayed, ticket.id).toEqual({
        status: ticket.status,
        priority: ticket.priority,
        assigneeId: ticket.assigneeId,
        labelIds: labelIds.toSorted((a, b) => a - b),
      });
    }
  });

  it("keeps every comment and event between opening and the last update, before now", () => {
    const commentsByTicket = groupByTicket(database.select().from(comments).all());
    const eventsByTicket = groupByTicket(database.select().from(ticketEvents).all());

    for (const ticket of allTickets()) {
      const times = [
        ...(commentsByTicket.get(ticket.id) ?? []),
        ...(eventsByTicket.get(ticket.id) ?? []),
      ].map((entry) => entry.createdAt);
      const lastActivity = [ticket.createdAt, ...times].toSorted().at(-1);

      expect(
        times.every((time) => time >= ticket.createdAt),
        ticket.id,
      ).toBe(true);
      expect(ticket.updatedAt, ticket.id).toBe(lastActivity);
      expect(ticket.updatedAt <= TEST_NOW.toISOString(), ticket.id).toBe(true);
    }
  });

  it("sets firstRespondedAt to the first public reply", () => {
    const repliesByTicket = groupByTicket(
      database.select().from(comments).where(eq(comments.kind, "public_reply")).all(),
    );

    for (const ticket of allTickets()) {
      const firstReply = (repliesByTicket.get(ticket.id) ?? [])
        .map((reply) => reply.createdAt)
        .toSorted()[0];
      expect(ticket.firstRespondedAt, ticket.id).toBe(firstReply ?? null);
    }
  });

  it("sets resolvedAt exactly on resolved and closed tickets", () => {
    for (const ticket of allTickets()) {
      expect(ticket.resolvedAt !== null, ticket.id).toBe(isResolvedStatus(ticket.status));
    }
  });

  it("has customer messages written by the ticket's requester", () => {
    const customerMessages = database
      .select({ ticketId: comments.ticketId, authorContactId: comments.authorContactId })
      .from(comments)
      .where(eq(comments.kind, "customer_message"))
      .all();
    const requesterOf = new Map(allTickets().map((ticket) => [ticket.id, ticket.requesterId]));

    for (const message of customerMessages) {
      expect(message.authorContactId).toBe(requesterOf.get(message.ticketId));
    }
  });

  it("has bigger customers write in more often", () => {
    const requests = database
      .select({ tier: organizations.tier })
      .from(tickets)
      .innerJoin(contacts, eq(contacts.id, tickets.requesterId))
      .innerJoin(organizations, eq(organizations.id, contacts.organizationId))
      .all();
    const customers = database.select({ tier: organizations.tier }).from(organizations).all();
    const ticketsPerCustomer = (tier: CustomerTier) =>
      requests.filter((request) => request.tier === tier).length /
      customers.filter((customer) => customer.tier === tier).length;

    expect(ticketsPerCustomer("enterprise")).toBeGreaterThan(ticketsPerCustomer("pro"));
    expect(ticketsPerCustomer("pro")).toBeGreaterThan(ticketsPerCustomer("free"));
  });

  it("includes a few long threads", () => {
    const commentCounts = [...groupByTicket(database.select().from(comments).all()).values()].map(
      (ticketComments) => ticketComments.length,
    );

    expect(commentCounts.filter((total) => total >= 12).length).toBeGreaterThanOrEqual(6);
  });

  it("builds exactly the same data from the same date", () => {
    expect(buildSeedData(TEST_NOW)).toEqual(buildSeedData(TEST_NOW));
  });

  it("gives every copy the same tickets and ids, whatever day it is seeded", () => {
    const withoutTimes = (data: SeedData) =>
      data.tickets.map(({ id, status, priority, assigneeId, requesterId, title }) => ({
        id,
        status,
        priority,
        assigneeId,
        requesterId,
        title,
      }));
    const onTheSeedDate = withoutTimes(seedDataFor(SEED_DATE));

    for (const now of [
      "2026-09-30T06:30:00.000Z", // the next morning, before the seed date's time of day
      "2026-10-04T15:00:00.000Z", // a Sunday
      "2026-10-26T09:00:00.000Z", // after Europe's clocks go back
      "2026-09-20T12:00:00.000Z", // before the seed date
    ]) {
      expect(withoutTimes(seedDataFor(new Date(now)))).toEqual(onTheSeedDate);
    }
  });

  it("looks just as recent whenever it is seeded", () => {
    const now = new Date("2026-09-30T06:30:00.000Z");
    const latestUpdate = (data: SeedData) =>
      Math.max(...data.tickets.map((ticket) => Date.parse(ticket.updatedAt)));

    expect(now.getTime() - latestUpdate(seedDataFor(now))).toBe(
      SEED_DATE.getTime() - latestUpdate(seedDataFor(SEED_DATE)),
    );
  });

  it("replaces the data when it runs again", () => {
    const copy = createTestDatabase();

    seedDatabase(copy, TEST_NOW);

    expect(copy.select({ total: count() }).from(tickets).get()?.total).toBe(350);
  });
});

type ReplayedState = {
  status: TicketStatus;
  priority: TicketPriority;
  assigneeId: string | null;
  labelIds: number[];
};

/** Plays a ticket's events forward from how every ticket starts: open, unassigned, unlabelled. */
function replay(events: TicketEventRow[], currentPriority: TicketPriority): ReplayedState {
  const firstPriorityChange = events.find((event) => event.type === "priority_changed");
  const state: ReplayedState = {
    status: "open",
    priority: ticketPrioritySchema.parse(firstPriorityChange?.fromValue ?? currentPriority),
    assigneeId: null,
    labelIds: [],
  };

  for (const event of events) {
    if (event.type === "status_changed") {
      expect(event.fromValue).toBe(state.status);
      state.status = ticketStatusSchema.parse(event.toValue);
    }
    if (event.type === "priority_changed") {
      state.priority = ticketPrioritySchema.parse(event.toValue);
    }
    if (event.type === "assignee_changed") {
      expect(event.fromValue).toBe(state.assigneeId);
      state.assigneeId = event.toValue;
    }
    if (event.type === "label_added") {
      state.labelIds.push(Number(event.toValue));
    }
  }
  state.labelIds.sort((a, b) => a - b);
  return state;
}
