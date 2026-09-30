import { ticketEventSchema } from "@support-desk/shared";
import { describe, expect, it } from "vitest";
import { createTestApp, getJson, VIEWER_USER_ID } from "../../test/test-app.ts";

async function getActivity(path: string, userId?: string) {
  const { app } = createTestApp(userId);
  const response = await getJson(app, path);
  return { status: response.status, body: response.body };
}

describe("GET /api/projects/:projectId/tickets/:ticketId/activity", () => {
  it("returns every change, oldest first, with the people and labels filled in", async () => {
    const { status, body } = await getActivity("/api/projects/checkout/tickets/CHK-196/activity");

    expect(status).toBe(200);
    const events = ticketEventSchema.array().parse(body);
    expect(events).toMatchObject([
      {
        type: "assignee_changed",
        actor: { id: "maya-chen" },
        from: null,
        to: { id: "diego-alvarez", name: "Diego Alvarez" },
        createdAt: "2026-09-27T18:29:00.000Z",
      },
      { type: "label_added", label: { id: 1, name: "Bug", color: "red" } },
      { type: "label_added", label: { id: 4, name: "Payments", color: "green" } },
      { type: "status_changed", actor: { id: "diego-alvarez" }, from: "open", to: "in_progress" },
      { type: "status_changed", from: "in_progress", to: "blocked" },
      { type: "status_changed", from: "blocked", to: "in_progress" },
    ]);
  });

  it("shows changes Support Desk made on its own without an actor", async () => {
    const { body } = await getActivity("/api/projects/checkout/tickets/CHK-196/activity");

    const events = ticketEventSchema.array().parse(body);
    expect(events.at(-1)).toMatchObject({ actor: null, from: "blocked", to: "in_progress" });
  });

  it("is open to viewers", async () => {
    const { status } = await getActivity(
      "/api/projects/checkout/tickets/CHK-196/activity",
      VIEWER_USER_ID,
    );

    expect(status).toBe(200);
  });

  it("returns 404 for a hidden project and for an unknown ticket", async () => {
    const hidden = await getActivity("/api/projects/billing/tickets/BIL-101/activity");
    const unknown = await getActivity("/api/projects/checkout/tickets/CHK-999/activity");

    expect(hidden.status).toBe(404);
    expect(unknown).toEqual({
      status: 404,
      body: { error: { code: "not_found", message: 'Ticket "CHK-999" was not found.' } },
    });
  });
});
