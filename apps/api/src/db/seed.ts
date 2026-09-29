import type { AppDatabase } from "./client.ts";
import { projectMembers, projects, type TicketRow, tickets, users } from "./schema.ts";
import { checkoutTickets } from "./seed-data/checkout-tickets.ts";
import { internalToolsTickets } from "./seed-data/internal-tools-tickets.ts";
import { mobileAppTickets } from "./seed-data/mobile-app-tickets.ts";
import { seedProjectMembers, seedProjects } from "./seed-data/projects.ts";
import type { SeedTicket } from "./seed-data/seed-ticket.ts";
import { seedUsers } from "./seed-data/users.ts";

const MILLISECONDS_PER_HOUR = 60 * 60 * 1000;

const seedTicketsByProject: Record<string, SeedTicket[]> = {
  checkout: checkoutTickets,
  "mobile-app": mobileAppTickets,
  "internal-tools": internalToolsTickets,
};

export type SeedSummary = {
  users: number;
  projects: number;
  tickets: number;
};

/**
 * Replaces all data with the demo data set. Timestamps are relative to
 * `referenceDate`, so tests can pass a fixed date and get identical data.
 */
export function seedDatabase(database: AppDatabase, referenceDate = new Date()): SeedSummary {
  const ticketRows = buildTicketRows(referenceDate);

  database.transaction((transaction) => {
    transaction.delete(tickets).run();
    transaction.delete(projectMembers).run();
    transaction.delete(projects).run();
    transaction.delete(users).run();

    transaction.insert(users).values(seedUsers).run();
    transaction.insert(projects).values(seedProjects).run();
    transaction.insert(projectMembers).values(seedProjectMembers).run();
    transaction.insert(tickets).values(ticketRows).run();
  });

  return { users: seedUsers.length, projects: seedProjects.length, tickets: ticketRows.length };
}

export function isDatabaseEmpty(database: AppDatabase): boolean {
  const anyUser = database.select({ id: users.id }).from(users).limit(1).get();
  return anyUser === undefined;
}

function buildTicketRows(referenceDate: Date): TicketRow[] {
  return Object.entries(seedTicketsByProject).flatMap(([projectId, seedTickets]) =>
    seedTickets.map((seedTicket) => toTicketRow(seedTicket, projectId, referenceDate)),
  );
}

function toTicketRow(seedTicket: SeedTicket, projectId: string, referenceDate: Date): TicketRow {
  return {
    id: seedTicket.id,
    projectId,
    title: seedTicket.title,
    description: seedTicket.description,
    status: seedTicket.status,
    priority: seedTicket.priority,
    assigneeId: seedTicket.assigneeId,
    createdAt: hoursBefore(referenceDate, seedTicket.createdDaysAgo * 24),
    updatedAt: hoursBefore(referenceDate, seedTicket.updatedHoursAgo),
  };
}

function hoursBefore(date: Date, hours: number): string {
  return new Date(date.getTime() - hours * MILLISECONDS_PER_HOUR).toISOString();
}
