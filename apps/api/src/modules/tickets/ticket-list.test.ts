import { ticketPageSchema, ticketPriorities } from "@support-desk/shared";
import { describe, expect, it } from "vitest";
import { createTestApp, getJson, VIEWER_USER_ID } from "../../test/test-app.ts";

async function listTickets(path: string, userId?: string) {
  const { app } = createTestApp(userId);
  const response = await getJson(app, path);
  return { status: response.status, page: ticketPageSchema.parse(response.body) };
}

describe("GET /api/projects/:projectId/tickets", () => {
  it("returns the first 25 tickets, most recently updated first", async () => {
    const { status, page } = await listTickets("/api/projects/checkout/tickets");

    expect(status).toBe(200);
    expect(page).toMatchObject({ page: 1, pageSize: 25, totalItems: 105, totalPages: 5 });
    expect(page.items.map((ticket) => ticket.id).slice(0, 3)).toEqual([
      "CHK-205",
      "CHK-196",
      "CHK-204",
    ]);
    const updatedTimes = page.items.map((ticket) => ticket.updatedAt);
    expect(updatedTimes).toEqual(updatedTimes.toSorted().reverse());
  });

  it("describes each ticket with its requester, organization and labels", async () => {
    const { page } = await listTickets("/api/projects/checkout/tickets");

    const ticket = page.items.find((item) => item.id === "CHK-196");
    expect(ticket).toMatchObject({
      title: "Customers charged twice when 3-D Secure times out and they retry",
      status: "in_progress",
      priority: "urgent",
      assignee: { id: "diego-alvarez", name: "Diego Alvarez" },
      requester: {
        name: "Daniel Okoye",
        email: "daniel@atlassportsgroup.example",
        organization: { id: "atlas-sports-group", name: "Atlas Sports Group", tier: "enterprise" },
      },
      labels: [
        { name: "Bug", color: "red" },
        { name: "Payments", color: "green" },
      ],
      firstRespondedAt: "2026-09-27T18:31:00.000Z",
      resolvedAt: null,
    });
    expect(ticket).not.toHaveProperty("description");
  });

  it("returns the rest on the last page, and an empty page after it", async () => {
    const lastPage = await listTickets("/api/projects/checkout/tickets?page=5");
    const afterLastPage = await listTickets("/api/projects/checkout/tickets?page=6");

    expect(lastPage.page.items).toHaveLength(5);
    expect(afterLastPage.page).toMatchObject({ items: [], totalPages: 5 });
  });

  it("sorts by priority, most urgent first and then by last update", async () => {
    const { page } = await listTickets("/api/projects/checkout/tickets?sort=priority");

    expect(page.items.slice(0, 3).map((ticket) => ticket.id)).toEqual([
      "CHK-205",
      "CHK-196",
      "CHK-204",
    ]);
    const ranks = page.items.map((ticket) => ticketPriorities.indexOf(ticket.priority));
    expect(ranks).toEqual(ranks.toSorted((a, b) => b - a));
  });

  it("sorts by priority the other way round", async () => {
    const { page } = await listTickets(
      "/api/projects/checkout/tickets?sort=priority&direction=asc",
    );

    expect(page.items.slice(0, 2).map((ticket) => [ticket.id, ticket.priority])).toEqual([
      ["CHK-203", "low"],
      ["CHK-177", "low"],
    ]);
  });

  it("sorts by creation, oldest or newest first", async () => {
    const oldest = await listTickets("/api/projects/checkout/tickets?sort=created&direction=asc");
    const newest = await listTickets("/api/projects/checkout/tickets?sort=created");

    expect(oldest.page.items[0]?.id).toBe("CHK-101");
    expect(newest.page.items[0]?.id).toBe("CHK-205");
  });

  it("is open to viewers", async () => {
    const { status } = await listTickets("/api/projects/checkout/tickets", VIEWER_USER_ID);

    expect(status).toBe(200);
  });

  it("filters by one status", async () => {
    const { status, page } = await listTickets("/api/projects/checkout/tickets?status=blocked");

    expect(status).toBe(200);
    expect(page.totalItems).toBe(12);
    expect(page.items[0]?.id).toBe("CHK-188");
  });

  it("combines repeated statuses with OR", async () => {
    const { page } = await listTickets("/api/projects/checkout/tickets?status=open&status=blocked");

    expect(page.totalItems).toBe(32);
  });

  it("combines priority and assignee with AND", async () => {
    const { page } = await listTickets(
      "/api/projects/checkout/tickets?priority=urgent&assignee=unassigned",
    );

    expect(page.items.map((ticket) => ticket.id)).toEqual(["CHK-205", "CHK-204"]);
  });

  it("treats assignee=me as the current user, in every status", async () => {
    const { page } = await listTickets("/api/projects/checkout/tickets?assignee=me");

    expect(page.totalItems).toBe(21);
  });

  it("ORs assignees and ANDs them with statuses", async () => {
    const { page } = await listTickets(
      "/api/projects/checkout/tickets?assignee=me&assignee=unassigned&status=open&status=in_progress&status=blocked",
    );

    expect(page.totalItems).toBe(19);
  });

  it("ORs labels without counting a ticket twice", async () => {
    const { page } = await listTickets("/api/projects/checkout/tickets?label=4&label=5");

    expect(page.totalItems).toBe(38);
  });

  it("ANDs status, priority and label, in the default order", async () => {
    const { page } = await listTickets(
      "/api/projects/checkout/tickets?status=open&status=in_progress&priority=high&priority=urgent&label=4",
    );

    expect(page.items.map((ticket) => ticket.id)).toEqual([
      "CHK-196",
      "CHK-182",
      "CHK-160",
      "CHK-176",
    ]);
  });

  it("combines filters with sort and page, counting only the matches", async () => {
    const byPriority = await listTickets(
      "/api/projects/checkout/tickets?status=blocked&sort=priority",
    );
    const secondPage = await listTickets("/api/projects/checkout/tickets?label=4&label=5&page=2");

    expect(byPriority.page.totalItems).toBe(12);
    expect(byPriority.page.items[0]?.id).toBe("CHK-191");
    expect(secondPage.page).toMatchObject({ page: 2, totalItems: 38, totalPages: 2 });
    expect(secondPage.page.items).toHaveLength(13);
    expect(secondPage.page.items[0]?.id).toBe("CHK-144");
  });

  it.each(["page=0", "page=-1", "page=1.5", "page=two", "sort=title", "direction=up"])(
    "rejects %s with a validation error",
    async (query) => {
      const { app } = createTestApp();

      const response = await getJson(app, `/api/projects/checkout/tickets?${query}`);

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({ error: { code: "validation_error" } });
    },
  );

  it.each(["status=done", "priority=critical", "label=payments", "assignee="])(
    "rejects %s with a validation error",
    async (query) => {
      const { app } = createTestApp();

      const response = await getJson(app, `/api/projects/checkout/tickets?${query}`);

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({ error: { code: "validation_error" } });
    },
  );

  it("rejects a label from another project", async () => {
    const { app } = createTestApp();

    const response = await getJson(app, "/api/projects/checkout/tickets?label=10");

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: { code: "validation_error", message: "label: 10 is not a label of this project." },
    });
  });

  it("returns the same 404 for a hidden project and a missing one", async () => {
    const { app } = createTestApp();

    const hidden = await getJson(app, "/api/projects/billing/tickets");
    const missing = await getJson(app, "/api/projects/unknown/tickets");

    expect(hidden).toEqual({
      status: 404,
      body: { error: { code: "not_found", message: 'Project "billing" was not found.' } },
    });
    expect(missing.status).toBe(404);
  });
});
