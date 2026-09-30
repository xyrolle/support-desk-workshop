import {
  bulkTicketUpdateResultSchema,
  ticketDetailSchema,
  ticketEventSchema,
} from "@support-desk/shared";
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
const bulkPath = "/api/projects/checkout/tickets";
const ticketIds = ["CHK-205", "CHK-204", "CHK-203"];

function ticketPath(ticketId: string) {
  return `/api/projects/checkout/tickets/${ticketId}`;
}

async function patchTickets(app: TestApp, body: unknown) {
  return sendJson(app, "PATCH", bulkPath, body);
}

/** The events this test wrote: the seed's events are all older than the fixed clock. */
async function newEvents(app: TestApp, ticketId: string) {
  const response = await getJson(app, `${ticketPath(ticketId)}/activity`);
  return ticketEventSchema
    .array()
    .parse(response.body)
    .filter((event) => event.createdAt === now);
}

function assignToMaya(ticketId: string) {
  return { ticketId, changes: { status: "in_progress" as const, assigneeId: "maya-chen" } };
}

describe("PATCH /api/projects/:projectId/tickets", () => {
  it("rejects an empty list, more than 100 updates, a repeated ticket, and a bad change", async () => {
    const { app } = createTestApp();

    const empty = await patchTickets(app, { updates: [] });
    const tooMany = await patchTickets(app, {
      updates: Array.from({ length: 101 }, (_, index) => ({
        ticketId: `CHK-${index}`,
        changes: { status: "open" },
      })),
    });
    const repeated = await patchTickets(app, {
      updates: [assignToMaya("CHK-205"), assignToMaya("CHK-205")],
    });
    const emptyChange = await patchTickets(app, {
      updates: [{ ticketId: "CHK-205", changes: {} }],
    });
    const unknownField = await patchTickets(app, {
      updates: [{ ticketId: "CHK-205", changes: { title: "not editable" } }],
    });

    expect(empty.status).toBe(400);
    expect(tooMany.status).toBe(400);
    expect(repeated.status).toBe(400);
    expect(emptyChange.status).toBe(400);
    expect(unknownField.status).toBe(400);
    for (const response of [empty, tooMany, repeated, emptyChange, unknownField]) {
      expect(response.body).toMatchObject({ error: { code: "validation_error" } });
    }
    expect(repeated.body).toMatchObject({
      error: { message: "updates: Each ticket can appear only once." },
    });
  });

  it("updates every ticket in one response and records one event per change", async () => {
    const { app } = createTestApp();

    const response = await patchTickets(app, { updates: ticketIds.map(assignToMaya) });
    const result = bulkTicketUpdateResultSchema.parse(response.body);

    expect(response.status).toBe(200);
    expect(result.tickets.map((ticket) => ticket.id)).toEqual(ticketIds);
    for (const ticket of result.tickets) {
      expect(ticket).toMatchObject({
        status: "in_progress",
        assignee: { id: "maya-chen" },
        updatedAt: now,
      });
    }
    expect(response.body).toMatchObject({ tickets: expect.any(Array) });
    const rawTickets = (response.body as { tickets: object[] }).tickets;
    for (const ticket of rawTickets) {
      expect(ticket).not.toHaveProperty("description");
    }
    expect(result.previous.find((state) => state.ticketId === "CHK-203")).toEqual({
      ticketId: "CHK-203",
      status: "open",
      priority: "low",
      assigneeId: null,
      labelIds: [],
    });

    const events = await Promise.all(ticketIds.map((ticketId) => newEvents(app, ticketId)));
    expect(events.flat()).toHaveLength(6);
    for (const ticketEvents of events) {
      expect(ticketEvents).toMatchObject([
        {
          type: "status_changed",
          to: "in_progress",
          actor: { id: "maya-chen" },
          createdAt: now,
        },
        {
          type: "assignee_changed",
          to: { id: "maya-chen" },
          actor: { id: "maya-chen" },
          createdAt: now,
        },
      ]);
    }
  });

  it("restores every ticket when the previous values are sent back, and keeps the old events", async () => {
    const { app } = createTestApp();
    const before = await Promise.all(
      ticketIds.map(async (ticketId) =>
        ticketDetailSchema.parse((await getJson(app, ticketPath(ticketId))).body),
      ),
    );

    const first = bulkTicketUpdateResultSchema.parse(
      (await patchTickets(app, { updates: ticketIds.map(assignToMaya) })).body,
    );
    const undo = await patchTickets(app, {
      updates: first.previous.map((state) => ({
        ticketId: state.ticketId,
        changes: {
          status: state.status,
          priority: state.priority,
          assigneeId: state.assigneeId,
          labelIds: state.labelIds,
        },
      })),
    });
    const restored = bulkTicketUpdateResultSchema.parse(undo.body);

    expect(undo.status).toBe(200);
    expect(restored.tickets.map(editableState)).toEqual(before.map(editableState));
    for (const ticketId of ticketIds) {
      const events = await newEvents(app, ticketId);
      expect(events.map((event) => event.type)).toEqual([
        "status_changed",
        "assignee_changed",
        "status_changed",
        "assignee_changed",
      ]);
    }
  });

  it.each([
    ["an unknown ticket", "CHK-999"],
    ["a ticket from another project", "MOB-101"],
  ])("changes nothing when the batch includes %s", async (_label, ticketId) => {
    const { app } = createTestApp();
    const before = (await getJson(app, ticketPath("CHK-205"))).body;

    const response = await patchTickets(app, {
      updates: [
        { ticketId: "CHK-205", changes: { status: "closed" } },
        { ticketId, changes: { status: "closed" } },
      ],
    });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: { code: "not_found", message: `Ticket "${ticketId}" was not found.` },
    });
    expect((await getJson(app, ticketPath("CHK-205"))).body).toEqual(before);
    expect(await newEvents(app, "CHK-205")).toEqual([]);
  });

  it("changes nothing when an assignee cannot work the project's tickets", async () => {
    const { app } = createTestApp();
    const before = (await getJson(app, ticketPath("CHK-205"))).body;

    const response = await patchTickets(app, {
      updates: [
        { ticketId: "CHK-205", changes: { status: "in_progress" } },
        { ticketId: "CHK-204", changes: { assigneeId: "ravi-patel" } },
      ],
    });

    expect(response).toEqual({
      status: 400,
      body: {
        error: {
          code: "validation_error",
          message: 'assigneeId: "ravi-patel" is not an agent or admin of this project.',
        },
      },
    });
    expect((await getJson(app, ticketPath("CHK-205"))).body).toEqual(before);
    expect(await newEvents(app, "CHK-205")).toEqual([]);
    expect(await newEvents(app, "CHK-204")).toEqual([]);
  });

  it("is forbidden to viewers, and a hidden project is a 404", async () => {
    const viewer = createTestApp(VIEWER_USER_ID);
    const forbidden = await patchTickets(viewer.app, {
      updates: [{ ticketId: "CHK-205", changes: { status: "closed" } }],
    });
    expect(forbidden).toEqual({
      status: 403,
      body: {
        error: {
          code: "forbidden",
          message: "Viewers of Checkout cannot change or comment on tickets.",
        },
      },
    });
    expect(await newEvents(viewer.app, "CHK-205")).toEqual([]);

    const { app } = createTestApp();
    const hidden = await sendJson(app, "PATCH", "/api/projects/billing/tickets", {
      updates: [{ ticketId: "BIL-101", changes: { status: "closed" } }],
    });
    expect(hidden).toEqual({
      status: 404,
      body: { error: { code: "not_found", message: 'Project "billing" was not found.' } },
    });
  });
});

function editableState(ticket: {
  status: string;
  priority: string;
  assignee: { id: string } | null;
  labels: { id: number }[];
  resolvedAt: string | null;
}) {
  return {
    status: ticket.status,
    priority: ticket.priority,
    assigneeId: ticket.assignee?.id ?? null,
    labelIds: ticket.labels.map((label) => label.id),
    resolvedAt: ticket.resolvedAt,
  };
}
