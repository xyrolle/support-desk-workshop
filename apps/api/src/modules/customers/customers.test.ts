import { organizationDetailSchema, ticketPageSchema } from "@support-desk/shared";
import { describe, expect, it } from "vitest";
import { createTestApp, getJson, VIEWER_USER_ID } from "../../test/test-app.ts";

describe("GET /api/organizations/:organizationId", () => {
  it("returns the organization with its tier, contacts and ticket counts", async () => {
    const { app } = createTestApp();

    const response = await getJson(app, "/api/organizations/atlas-sports-group");

    expect(response.status).toBe(200);
    expect(organizationDetailSchema.parse(response.body)).toEqual({
      id: "atlas-sports-group",
      name: "Atlas Sports Group",
      tier: "enterprise",
      domain: "atlassportsgroup.example",
      customerSince: "2022-11-24",
      contacts: [
        { id: 17, name: "Daniel Okoye", email: "daniel@atlassportsgroup.example" },
        { id: 18, name: "Grace Mensah", email: "grace@atlassportsgroup.example" },
        { id: 19, name: "Kwame Asante", email: "kwame@atlassportsgroup.example" },
        { id: 20, name: "Laura Fitzgerald", email: "laura@atlassportsgroup.example" },
      ],
      ticketCount: 15,
      unresolvedTicketCount: 6,
    });
  });

  it("only counts tickets in projects the user can see", async () => {
    const { app } = createTestApp(VIEWER_USER_ID);

    const response = await getJson(app, "/api/organizations/atlas-sports-group");

    // Ravi also sees Billing, where Atlas has one open ticket.
    expect(organizationDetailSchema.parse(response.body)).toMatchObject({
      ticketCount: 16,
      unresolvedTicketCount: 7,
    });
  });

  it("returns 404 for an unknown organization", async () => {
    const { app } = createTestApp();

    const response = await getJson(app, "/api/organizations/acme");

    expect(response).toEqual({
      status: 404,
      body: { error: { code: "not_found", message: 'Organization "acme" was not found.' } },
    });
  });
});

describe("GET /api/organizations/:organizationId/tickets", () => {
  it("lists the organization's tickets from the user's projects, most recent first", async () => {
    const { app } = createTestApp();

    const response = await getJson(app, "/api/organizations/atlas-sports-group/tickets");

    expect(response.status).toBe(200);
    const page = ticketPageSchema.parse(response.body);
    expect(page.totalItems).toBe(15);
    expect(page.items.slice(0, 3).map((ticket) => ticket.id)).toEqual([
      "CHK-196",
      "CHK-182",
      "CHK-195",
    ]);
    expect(page.items.map((ticket) => ticket.projectId)).not.toContain("billing");
    for (const ticket of page.items) {
      expect(ticket.requester.organization.id).toBe("atlas-sports-group");
    }
  });

  it("validates the list query and the organization", async () => {
    const { app } = createTestApp();

    const badSort = await getJson(app, "/api/organizations/atlas-sports-group/tickets?sort=x");
    const unknown = await getJson(app, "/api/organizations/acme/tickets");

    expect(badSort.status).toBe(400);
    expect(unknown.status).toBe(404);
  });
});
