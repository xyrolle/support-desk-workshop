import { ticketDetailSchema, ticketPageSchema } from "@support-desk/shared";
import { describe, expect, it } from "vitest";
import { createTestApp, getJson, TEST_NOW } from "../../test/test-app.ts";

const measuredAt = TEST_NOW.toISOString();

describe("SLA on tickets", () => {
  it("measures both clocks on the list and on the ticket", async () => {
    const { app } = createTestApp();
    const list = await getJson(app, "/api/projects/checkout/tickets");
    const page = ticketPageSchema.parse(list.body);
    const ticket = (id: string) => page.items.find((item) => item.id === id);

    expect(ticket("CHK-205")?.sla).toMatchObject({
      measuredAt,
      firstResponse: { state: "running", targetMinutes: 60, elapsedMinutes: 35 },
    });
    expect(ticket("CHK-204")?.sla.firstResponse).toEqual({
      state: "breached",
      targetMinutes: 120,
      elapsedMinutes: 162,
    });
    expect(ticket("CHK-196")?.sla).toMatchObject({
      measuredAt,
      firstResponse: { state: "met", targetMinutes: 60, elapsedMinutes: 0 },
      resolution: { state: "breached", targetMinutes: 540, elapsedMinutes: 900 },
    });

    const blocked = await getJson(app, "/api/projects/checkout/tickets/CHK-194");
    expect(ticketDetailSchema.parse(blocked.body).sla.resolution.state).toBe("paused");
  });

  it("returns the at-risk tickets, combined with the other filters and the sort", async () => {
    const { app } = createTestApp();
    const page = ticketPageSchema.parse(
      (await getJson(app, "/api/projects/checkout/tickets?sla=at_risk")).body,
    );
    const ids = page.items.map((ticket) => ticket.id);

    expect(page).toMatchObject({ page: 1, totalItems: 17 });
    expect(page.items).toHaveLength(17);
    expect(ids).toEqual(expect.arrayContaining(["CHK-202", "CHK-205"]));
    expect(ids).not.toContain("CHK-194");
    expect(page.items.every((ticket) => ticket.status !== "blocked")).toBe(true);

    const urgent = ticketPageSchema.parse(
      (await getJson(app, "/api/projects/checkout/tickets?sla=at_risk&priority=urgent")).body,
    );
    const urgentIds = page.items
      .filter((ticket) => ticket.priority === "urgent")
      .map((ticket) => ticket.id);
    expect(urgent.totalItems).toBe(urgentIds.length);
    expect(urgent.items.map((ticket) => ticket.id)).toEqual(urgentIds);

    const oldest = ticketPageSchema.parse(
      (await getJson(app, "/api/projects/checkout/tickets?sla=at_risk&sort=created&direction=asc"))
        .body,
    );
    const createdAt = oldest.items.map((ticket) => ticket.createdAt);
    expect(oldest.totalItems).toBe(17);
    expect(createdAt).toEqual(createdAt.toSorted());

    const secondPage = ticketPageSchema.parse(
      (await getJson(app, "/api/projects/checkout/tickets?sla=at_risk&page=2")).body,
    );
    expect(secondPage).toMatchObject({ items: [], totalItems: 17 });
  });

  it("rejects an unknown sla value", async () => {
    const { app } = createTestApp();

    const response = await getJson(app, "/api/projects/checkout/tickets?sla=breached");

    expect(response.status).toBe(400);
  });
});
