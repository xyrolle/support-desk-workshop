import { ticketPageSchema } from "@support-desk/shared";
import { describe, expect, it } from "vitest";
import { createTestApp, getJson } from "../../test/test-app.ts";

describe("GET /api/projects/:projectId/tickets", () => {
  it("returns the first 20 tickets, most recently updated first", async () => {
    const { app } = createTestApp();

    const response = await getJson(app, "/api/projects/checkout/tickets");

    expect(response.status).toBe(200);
    const page = ticketPageSchema.parse(response.body);
    expect(page).toMatchObject({ page: 1, pageSize: 20, totalItems: 30, totalPages: 2 });
    expect(page.items).toHaveLength(20);
    expect(page.items[0]?.id).toBe("CHK-130");
    expect(page.items.every((ticket) => ticket.projectId === "checkout")).toBe(true);

    const updatedTimes = page.items.map((ticket) => ticket.updatedAt);
    expect(updatedTimes).toEqual(updatedTimes.toSorted().reverse());
  });

  it("returns the remaining tickets on the last page", async () => {
    const { app } = createTestApp();

    const response = await getJson(app, "/api/projects/checkout/tickets?page=2");

    const page = ticketPageSchema.parse(response.body);
    expect(page.page).toBe(2);
    expect(page.items).toHaveLength(10);
  });

  it("returns an empty page after the last page", async () => {
    const { app } = createTestApp();

    const response = await getJson(app, "/api/projects/checkout/tickets?page=9");

    expect(response.status).toBe(200);
    const page = ticketPageSchema.parse(response.body);
    expect(page.items).toEqual([]);
    expect(page.totalPages).toBe(2);
  });

  it("includes the assignee, or null when the ticket is unassigned", async () => {
    const { app } = createTestApp();

    const response = await getJson(app, "/api/projects/checkout/tickets");

    const page = ticketPageSchema.parse(response.body);
    const assigned = page.items.find((ticket) => ticket.id === "CHK-101");
    const unassigned = page.items.find((ticket) => ticket.id === "CHK-102");
    expect(assigned?.assignee).toEqual({
      id: "diego-alvarez",
      name: "Diego Alvarez",
      initials: "DA",
      avatarColor: "amber",
    });
    expect(unassigned?.assignee).toBeNull();
  });

  it.each(["0", "-1", "1.5", "two"])("rejects page=%s with a validation error", async (page) => {
    const { app } = createTestApp();

    const response = await getJson(app, `/api/projects/checkout/tickets?page=${page}`);

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({ error: { code: "validation_error" } });
  });

  it("returns 404 for a project the user is not a member of", async () => {
    const { app } = createTestApp();

    const response = await getJson(app, "/api/projects/internal-tools/tickets");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: { code: "not_found", message: 'Project "internal-tools" was not found.' },
    });
  });

  it("returns 404 for a project that does not exist", async () => {
    const { app } = createTestApp();

    const response = await getJson(app, "/api/projects/unknown/tickets");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: { code: "not_found", message: 'Project "unknown" was not found.' },
    });
  });
});
