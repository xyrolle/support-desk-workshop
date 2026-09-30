import { ticketPageSchema, unresolvedStatuses } from "@support-desk/shared";
import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { tickets } from "../../db/schema.ts";
import { createTestApp, getJson } from "../../test/test-app.ts";

describe("GET /api/me/tickets", () => {
  it("lists the unresolved tickets assigned to the current user, across their projects", async () => {
    const { app } = createTestApp();

    const response = await getJson(app, "/api/me/tickets");

    expect(response.status).toBe(200);
    const page = ticketPageSchema.parse(response.body);
    expect(page.totalItems).toBe(15);
    expect(page.items.slice(0, 3).map((ticket) => ticket.id)).toEqual([
      "MOB-184",
      "INT-168",
      "CHK-181",
    ]);
    expect(new Set(page.items.map((ticket) => ticket.projectId))).toEqual(
      new Set(["checkout", "internal-tools", "mobile-app"]),
    );
    for (const ticket of page.items) {
      expect(ticket.assignee?.id).toBe("maya-chen");
      expect(unresolvedStatuses).toContain(ticket.status);
    }
  });

  it("sorts like the other lists", async () => {
    const { app } = createTestApp();

    const response = await getJson(app, "/api/me/tickets?sort=priority");

    const page = ticketPageSchema.parse(response.body);
    expect(page.items.slice(0, 2).map((ticket) => ticket.id)).toEqual(["MOB-184", "INT-153"]);
  });

  it("leaves out tickets from projects the user cannot see", async () => {
    const { app, database } = createTestApp();
    database
      .update(tickets)
      .set({ assigneeId: "maya-chen", status: "open" })
      .where(eq(tickets.id, "BIL-101"))
      .run();

    const response = await getJson(app, "/api/me/tickets");

    const page = ticketPageSchema.parse(response.body);
    expect(page.totalItems).toBe(15);
    expect(page.items.map((ticket) => ticket.projectId)).not.toContain("billing");
  });

  it("rejects an unknown sort", async () => {
    const { app } = createTestApp();

    const response = await getJson(app, "/api/me/tickets?sort=assignee");

    expect(response.status).toBe(400);
  });
});
