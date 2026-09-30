import { projectMemberSchema, type TicketStatus, unresolvedStatuses } from "@support-desk/shared";
import { and, eq, inArray } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import type { AppDatabase } from "../../db/client.ts";
import { ticketEvents, tickets } from "../../db/schema.ts";
import { createTestApp, getJson, sendJson, TEST_NOW, VIEWER_USER_ID } from "../../test/test-app.ts";

function assignedTicketIds(
  database: AppDatabase,
  projectId: string,
  userId: string,
  statuses: readonly TicketStatus[],
) {
  return database
    .select({ id: tickets.id })
    .from(tickets)
    .where(
      and(
        eq(tickets.projectId, projectId),
        eq(tickets.assigneeId, userId),
        inArray(tickets.status, [...statuses]),
      ),
    )
    .all()
    .map((ticket) => ticket.id);
}

describe("GET /api/projects/:projectId/members", () => {
  it("lists the members by name with their roles", async () => {
    const { app } = createTestApp();

    const response = await getJson(app, "/api/projects/checkout/members");

    expect(response.status).toBe(200);
    const members = projectMemberSchema.array().parse(response.body);
    expect(members.map((member) => [member.name, member.role])).toEqual([
      ["Chloé Martin", "agent"],
      ["Diego Alvarez", "agent"],
      ["Lena Fischer", "agent"],
      ["Maya Chen", "admin"],
      ["Priya Nair", "agent"],
      ["Ravi Patel", "viewer"],
    ]);
  });

  it("is open to viewers, who need it to read the project", async () => {
    const { app } = createTestApp(VIEWER_USER_ID);

    const response = await getJson(app, "/api/projects/checkout/members");

    expect(response.status).toBe(200);
  });

  it("returns the usual 404 for a hidden project", async () => {
    const { app } = createTestApp();

    const response = await getJson(app, "/api/projects/billing/members");

    expect(response).toEqual({
      status: 404,
      body: { error: { code: "not_found", message: 'Project "billing" was not found.' } },
    });
  });
});

describe("POST /api/projects/:projectId/members", () => {
  it("lets an admin add a teammate with a role", async () => {
    const { app } = createTestApp();

    const response = await sendJson(app, "POST", "/api/projects/checkout/members", {
      userId: "hana-kim",
      role: "agent",
    });

    expect(response.status).toBe(201);
    expect(projectMemberSchema.parse(response.body)).toMatchObject({
      id: "hana-kim",
      name: "Hana Kim",
      role: "agent",
    });
  });

  it("refuses a teammate who is already a member", async () => {
    const { app } = createTestApp();

    const response = await sendJson(app, "POST", "/api/projects/checkout/members", {
      userId: "diego-alvarez",
      role: "viewer",
    });

    expect(response).toEqual({
      status: 409,
      body: {
        error: { code: "conflict", message: "Diego Alvarez is already a member of Checkout." },
      },
    });
  });

  it("refuses an unknown teammate", async () => {
    const { app } = createTestApp();

    const response = await sendJson(app, "POST", "/api/projects/checkout/members", {
      userId: "someone-else",
      role: "agent",
    });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({ error: { code: "validation_error" } });
  });

  it.each([
    [{ userId: "hana-kim", role: "owner" }],
    [{ userId: "hana-kim" }],
    [{ userId: "hana-kim", role: "agent", note: "extra fields are rejected" }],
  ])("rejects the body %o", async (body) => {
    const { app } = createTestApp();

    const response = await sendJson(app, "POST", "/api/projects/checkout/members", body);

    expect(response.status).toBe(400);
  });

  it("is forbidden to agents", async () => {
    const { app } = createTestApp();

    const response = await sendJson(app, "POST", "/api/projects/mobile-app/members", {
      userId: "tomas-silva",
      role: "viewer",
    });

    expect(response).toEqual({
      status: 403,
      body: {
        error: { code: "forbidden", message: "Agents of Mobile App cannot manage members." },
      },
    });
  });

  it("is forbidden to viewers", async () => {
    const { app } = createTestApp(VIEWER_USER_ID);

    const response = await sendJson(app, "POST", "/api/projects/checkout/members", {
      userId: "hana-kim",
      role: "agent",
    });

    expect(response.status).toBe(403);
  });

  it("returns 404, not 403, for a hidden project", async () => {
    const { app } = createTestApp();

    const response = await sendJson(app, "POST", "/api/projects/billing/members", {
      userId: "maya-chen",
      role: "admin",
    });

    expect(response.status).toBe(404);
  });
});

describe("PATCH /api/projects/:projectId/members/:userId", () => {
  it("changes a member's role", async () => {
    const { app } = createTestApp();

    const response = await sendJson(app, "PATCH", "/api/projects/checkout/members/priya-nair", {
      role: "admin",
    });

    expect(response.status).toBe(200);
    expect(projectMemberSchema.parse(response.body).role).toBe("admin");
  });

  it("unassigns the unresolved tickets of a member who becomes a viewer", async () => {
    const { app, database } = createTestApp();
    const unresolved = assignedTicketIds(database, "checkout", "diego-alvarez", unresolvedStatuses);
    const resolved = assignedTicketIds(database, "checkout", "diego-alvarez", [
      "resolved",
      "closed",
    ]);
    expect(unresolved.length).toBeGreaterThan(0);

    await sendJson(app, "PATCH", "/api/projects/checkout/members/diego-alvarez", {
      role: "viewer",
    });

    expect(assignedTicketIds(database, "checkout", "diego-alvarez", unresolvedStatuses)).toEqual(
      [],
    );
    expect(
      assignedTicketIds(database, "checkout", "diego-alvarez", ["resolved", "closed"]),
    ).toEqual(resolved);
    const events = database
      .select()
      .from(ticketEvents)
      .where(eq(ticketEvents.createdAt, TEST_NOW.toISOString()))
      .all();
    expect(events.map((event) => event.ticketId).sort()).toEqual(unresolved.sort());
    expect(events[0]).toMatchObject({
      type: "assignee_changed",
      actorId: "maya-chen",
      fromValue: "diego-alvarez",
      toValue: null,
    });
  });

  it("keeps at least one admin", async () => {
    const { app } = createTestApp();

    const response = await sendJson(app, "PATCH", "/api/projects/checkout/members/maya-chen", {
      role: "agent",
    });

    expect(response).toEqual({
      status: 409,
      body: { error: { code: "conflict", message: "Checkout needs at least one admin." } },
    });
  });

  it("lets an admin step down once there is another admin", async () => {
    const { app } = createTestApp();
    await sendJson(app, "PATCH", "/api/projects/checkout/members/priya-nair", { role: "admin" });

    const response = await sendJson(app, "PATCH", "/api/projects/checkout/members/maya-chen", {
      role: "agent",
    });

    expect(response.status).toBe(200);
  });

  it("returns 404 for someone who is not a member", async () => {
    const { app } = createTestApp();

    const response = await sendJson(app, "PATCH", "/api/projects/checkout/members/hana-kim", {
      role: "viewer",
    });

    expect(response).toEqual({
      status: 404,
      body: { error: { code: "not_found", message: 'Member "hana-kim" was not found.' } },
    });
  });
});

describe("DELETE /api/projects/:projectId/members/:userId", () => {
  it("removes the member and unassigns their unresolved tickets in that project only", async () => {
    const { app, database } = createTestApp();
    const mobileTickets = assignedTicketIds(
      database,
      "mobile-app",
      "lena-fischer",
      unresolvedStatuses,
    );

    const response = await sendJson(app, "DELETE", "/api/projects/checkout/members/lena-fischer");

    expect(response.status).toBe(204);
    const members = projectMemberSchema
      .array()
      .parse((await getJson(app, "/api/projects/checkout/members")).body);
    expect(members.map((member) => member.id)).not.toContain("lena-fischer");
    expect(assignedTicketIds(database, "checkout", "lena-fischer", unresolvedStatuses)).toEqual([]);
    expect(assignedTicketIds(database, "mobile-app", "lena-fischer", unresolvedStatuses)).toEqual(
      mobileTickets,
    );
  });

  it("does not remove the last admin", async () => {
    const { app } = createTestApp();

    const response = await sendJson(app, "DELETE", "/api/projects/checkout/members/maya-chen");

    expect(response.status).toBe(409);
  });

  it("is forbidden to agents", async () => {
    const { app } = createTestApp();

    const response = await sendJson(app, "DELETE", "/api/projects/mobile-app/members/hana-kim");

    expect(response.status).toBe(403);
  });
});
