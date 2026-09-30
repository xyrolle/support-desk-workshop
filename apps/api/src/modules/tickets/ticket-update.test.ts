import { ticketDetailSchema, ticketEventSchema } from "@support-desk/shared";
import { describe, expect, it } from "vitest";
import {
  createTestApp,
  getJson,
  sendJson,
  TEST_NOW,
  type TestApp,
  VIEWER_USER_ID,
} from "../../test/test-app.ts";

const now = TEST_NOW.toISOString();
const newTicket = "/api/projects/checkout/tickets/CHK-205";

async function patchTicket(app: TestApp, path: string, changes: unknown) {
  const response = await sendJson(app, "PATCH", path, changes);
  return { status: response.status, ticket: ticketDetailSchema.parse(response.body) };
}

/** The events this test wrote: the seed's events are all older than the fixed clock. */
async function newEvents(app: TestApp, ticketPath: string) {
  const response = await getJson(app, `${ticketPath}/activity`);
  return ticketEventSchema
    .array()
    .parse(response.body)
    .filter((event) => event.createdAt === now);
}

describe("PATCH /api/projects/:projectId/tickets/:ticketId", () => {
  it("changes the status and records who did it", async () => {
    const { app } = createTestApp();

    const { status, ticket } = await patchTicket(app, newTicket, { status: "in_progress" });

    expect(status).toBe(200);
    expect(ticket).toMatchObject({ status: "in_progress", updatedAt: now });
    expect(await newEvents(app, newTicket)).toMatchObject([
      {
        type: "status_changed",
        from: "open",
        to: "in_progress",
        actor: { id: "maya-chen" },
        createdAt: now,
      },
    ]);
  });

  it("sets resolvedAt when a ticket is resolved, and clears it when it is reopened", async () => {
    const { app } = createTestApp();

    const resolved = await patchTicket(app, newTicket, { status: "resolved" });
    const reopened = await patchTicket(app, newTicket, { status: "open" });

    expect(resolved.ticket.resolvedAt).toBe(now);
    expect(reopened.ticket.resolvedAt).toBeNull();
  });

  it("keeps the original resolvedAt when a resolved ticket is closed", async () => {
    const { app } = createTestApp();

    const { ticket } = await patchTicket(app, "/api/projects/checkout/tickets/CHK-167", {
      status: "closed",
    });

    expect(ticket.resolvedAt).toBe("2026-09-29T03:05:00.000Z");
  });

  it("assigns and unassigns, recording both", async () => {
    const { app } = createTestApp();

    const assigned = await patchTicket(app, newTicket, { assigneeId: "diego-alvarez" });
    const unassigned = await patchTicket(app, newTicket, { assigneeId: null });

    expect(assigned.ticket.assignee?.name).toBe("Diego Alvarez");
    expect(unassigned.ticket.assignee).toBeNull();
    expect(await newEvents(app, newTicket)).toMatchObject([
      { type: "assignee_changed", from: null, to: { id: "diego-alvarez" } },
      { type: "assignee_changed", from: { id: "diego-alvarez" }, to: null },
    ]);
  });

  it("replaces the labels and records each label added or removed", async () => {
    const { app } = createTestApp();
    const ticketPath = "/api/projects/checkout/tickets/CHK-196";

    // CHK-196 has Bug (1) and Payments (4); Performance is 9.
    const { ticket } = await patchTicket(app, ticketPath, { labelIds: [4, 9] });

    expect(ticket.labels.map((label) => label.name)).toEqual(["Payments", "Performance"]);
    expect(await newEvents(app, ticketPath)).toMatchObject([
      { type: "label_added", label: { name: "Performance" } },
      { type: "label_removed", label: { name: "Bug" } },
    ]);
  });

  it("changes several properties at once, with one event each", async () => {
    const { app } = createTestApp();

    await patchTicket(app, newTicket, {
      status: "in_progress",
      priority: "high",
      assigneeId: "maya-chen",
      labelIds: [1],
    });

    const events = await newEvents(app, newTicket);
    expect(events.map((event) => event.type)).toEqual([
      "status_changed",
      "priority_changed",
      "assignee_changed",
      "label_added",
    ]);
  });

  it("writes nothing when nothing changes", async () => {
    const { app } = createTestApp();
    const before = ticketDetailSchema.parse((await getJson(app, newTicket)).body);

    const { status, ticket } = await patchTicket(app, newTicket, {
      status: "open",
      priority: "urgent",
    });

    expect(status).toBe(200);
    expect(ticket.updatedAt).toBe(before.updatedAt);
    expect(await newEvents(app, newTicket)).toEqual([]);
  });

  it("only assigns agents and admins of the project", async () => {
    const { app } = createTestApp();

    const viewer = await sendJson(app, "PATCH", newTicket, { assigneeId: "ravi-patel" });
    const outsider = await sendJson(app, "PATCH", newTicket, { assigneeId: "aisha-rahman" });

    expect(viewer).toEqual({
      status: 400,
      body: {
        error: {
          code: "validation_error",
          message: 'assigneeId: "ravi-patel" is not an agent or admin of this project.',
        },
      },
    });
    expect(outsider.status).toBe(400);
  });

  it("only accepts labels of the ticket's project", async () => {
    const { app } = createTestApp();

    // Label 10 is Mobile App's "Bug".
    const response = await sendJson(app, "PATCH", newTicket, { labelIds: [1, 10] });

    expect(response.body).toEqual({
      error: { code: "validation_error", message: "labelIds: 10 is not a label of this project." },
    });
  });

  it.each([
    [{}],
    [{ status: "done" }],
    [{ priority: "critical" }],
    [{ labelIds: ["Bug"] }],
    [{ title: "Titles are not edited here" }],
  ])("rejects the body %o", async (body) => {
    const { app } = createTestApp();

    const response = await sendJson(app, "PATCH", newTicket, body);

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({ error: { code: "validation_error" } });
  });

  it("is forbidden to viewers, and changes nothing", async () => {
    const { app } = createTestApp(VIEWER_USER_ID);

    const response = await sendJson(app, "PATCH", newTicket, { status: "closed" });

    expect(response).toEqual({
      status: 403,
      body: {
        error: {
          code: "forbidden",
          message: "Viewers of Checkout cannot change or comment on tickets.",
        },
      },
    });
    expect(await newEvents(app, newTicket)).toEqual([]);
  });

  it("returns 404 for a hidden project and for a ticket of another project", async () => {
    const { app } = createTestApp();

    const hidden = await sendJson(app, "PATCH", "/api/projects/billing/tickets/BIL-101", {
      status: "closed",
    });
    const elsewhere = await sendJson(app, "PATCH", "/api/projects/checkout/tickets/MOB-101", {
      status: "closed",
    });

    expect(hidden.status).toBe(404);
    expect(elsewhere.status).toBe(404);
  });
});
