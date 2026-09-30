import { ticketDetailSchema } from "@support-desk/shared";
import { describe, expect, it } from "vitest";
import { createTestApp, getJson } from "../../test/test-app.ts";

describe("GET /api/projects/:projectId/tickets/:ticketId", () => {
  it("returns the ticket with its description", async () => {
    const { app } = createTestApp();

    const response = await getJson(app, "/api/projects/checkout/tickets/CHK-196");

    expect(response.status).toBe(200);
    const ticket = ticketDetailSchema.parse(response.body);
    expect(ticket).toMatchObject({
      id: "CHK-196",
      projectId: "checkout",
      status: "in_progress",
      requester: { name: "Daniel Okoye", organization: { tier: "enterprise" } },
    });
    expect(ticket.description.length).toBeGreaterThan(100);
  });

  it("does not find a ticket through another project", async () => {
    const { app } = createTestApp();

    const response = await getJson(app, "/api/projects/checkout/tickets/MOB-101");

    expect(response).toEqual({
      status: 404,
      body: { error: { code: "not_found", message: 'Ticket "MOB-101" was not found.' } },
    });
  });

  it("returns 404 for an unknown ticket", async () => {
    const { app } = createTestApp();

    const response = await getJson(app, "/api/projects/checkout/tickets/CHK-999");

    expect(response.status).toBe(404);
  });

  it("answers a ticket in a hidden project with the project's 404, revealing nothing", async () => {
    const { app } = createTestApp();

    const response = await getJson(app, "/api/projects/billing/tickets/BIL-101");

    expect(response.body).toEqual({
      error: { code: "not_found", message: 'Project "billing" was not found.' },
    });
  });
});
