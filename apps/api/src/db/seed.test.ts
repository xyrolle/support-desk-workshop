import { describe, expect, it } from "vitest";
import { createTestApp, TEST_REFERENCE_DATE } from "../test/test-app.ts";
import { projectMembers, tickets } from "./schema.ts";
import { seedDatabase } from "./seed.ts";

describe("seedDatabase", () => {
  it("creates 70 tickets across three projects", () => {
    const { database } = createTestApp();

    const allTickets = database.select().from(tickets).all();
    const projectIds = new Set(allTickets.map((ticket) => ticket.projectId));

    expect(allTickets).toHaveLength(70);
    expect([...projectIds].sort()).toEqual(["checkout", "internal-tools", "mobile-app"]);
  });

  it("only assigns tickets to members of the ticket's project", () => {
    const { database } = createTestApp();

    const memberships = database.select().from(projectMembers).all();
    const isMember = (projectId: string, userId: string) =>
      memberships.some((member) => member.projectId === projectId && member.userId === userId);

    for (const ticket of database.select().from(tickets).all()) {
      if (ticket.assigneeId) {
        expect(isMember(ticket.projectId, ticket.assigneeId), ticket.id).toBe(true);
      }
    }
  });

  it("never updates a ticket before it was created", () => {
    const { database } = createTestApp();

    for (const ticket of database.select().from(tickets).all()) {
      expect(ticket.updatedAt >= ticket.createdAt, ticket.id).toBe(true);
    }
  });

  it("resets the data when run again", () => {
    const { database } = createTestApp();

    seedDatabase(database, TEST_REFERENCE_DATE);

    expect(database.select().from(tickets).all()).toHaveLength(70);
  });
});
