import { ticketPageSchema, ticketPriorities } from "@support-desk/shared";
import { describe, expect, it } from "vitest";
import { createTestApp, getJson, sendJson } from "../../test/test-app.ts";

describe("GET /api/projects/:projectId/tickets?q=", () => {
  it("finds a reply posted through the API", async () => {
    const { app } = createTestApp();
    const posted = await sendJson(app, "POST", "/api/projects/checkout/tickets/CHK-205/comments", {
      kind: "public_reply",
      body: "The xylophonequartz retry is ready to try.",
    });
    expect(posted.status).toBe(201);

    const response = await getJson(app, "/api/projects/checkout/tickets?q=xylophonequartz");

    expect(response.status).toBe(200);
    const page = ticketPageSchema.parse(response.body);
    expect(page.items.map((ticket) => ticket.id)).toEqual(["CHK-205"]);
  });

  it("matches every word as a prefix", async () => {
    const { app } = createTestApp();

    const response = await getJson(app, "/api/projects/checkout/tickets?q=refun");

    expect(response.status).toBe(200);
    const page = ticketPageSchema.parse(response.body);
    expect(page.totalItems).toBe(6);
    expect(page.items).toHaveLength(6);
  });

  it("ranks title matches ahead of the rest when no sort is given", async () => {
    const { app } = createTestApp();

    const response = await getJson(app, "/api/projects/checkout/tickets?q=apple%20pay");

    expect(response.status).toBe(200);
    const page = ticketPageSchema.parse(response.body);
    expect(page.totalItems).toBe(4);
    expect(page.items[0]?.id).toBe("CHK-197");
  });

  it("keeps an explicit sort when searching", async () => {
    const { app } = createTestApp();

    const ranked = ticketPageSchema.parse(
      (await getJson(app, "/api/projects/checkout/tickets?q=webhook")).body,
    );
    const response = await getJson(app, "/api/projects/checkout/tickets?q=webhook&sort=priority");

    expect(response.status).toBe(200);
    const page = ticketPageSchema.parse(response.body);
    expect(page.totalItems).toBe(12);
    const ranks = page.items.map((ticket) => ticketPriorities.indexOf(ticket.priority));
    expect(ranks).toEqual(ranks.toSorted((left, right) => right - left));
    expect(page.items.map((ticket) => ticket.id)).not.toEqual(
      ranked.items.map((ticket) => ticket.id),
    );
  });

  it("returns the matching passage as parts, never markup", async () => {
    const { app } = createTestApp();

    const response = await getJson(app, "/api/projects/checkout/tickets?q=apple%20pay");

    const page = ticketPageSchema.parse(response.body);
    const snippet = page.items[0]?.snippet;
    expect(snippet?.some((part) => part.highlighted && /apple|pay/i.test(part.text))).toBe(true);
    expect(JSON.stringify(snippet)).not.toMatch(/<[^>]+>/);
  });

  it("omits the snippet when the list is not a search", async () => {
    const { app } = createTestApp();

    const response = await getJson(app, "/api/projects/checkout/tickets");

    const page = ticketPageSchema.parse(response.body);
    expect(page.items.every((ticket) => ticket.snippet === undefined)).toBe(true);
  });

  it("finds a hyphenated phrase", async () => {
    const { app } = createTestApp();

    const response = await getJson(app, "/api/projects/checkout/tickets?q=3-D%20Secure");

    expect(response.status).toBe(200);
    const page = ticketPageSchema.parse(response.body);
    expect(page.totalItems).toBe(4);
    expect(page.items[0]?.id).toBe("CHK-176");
  });

  it("finds a word that appears only in internal notes", async () => {
    const { app } = createTestApp();

    const response = await getJson(app, "/api/projects/checkout/tickets?q=idempotency");

    const page = ticketPageSchema.parse(response.body);
    expect(page.items.map((ticket) => ticket.id)).toEqual(["CHK-196"]);
  });

  it("filters a search with the other list filters", async () => {
    const { app } = createTestApp();

    const all = ticketPageSchema.parse(
      (await getJson(app, "/api/projects/checkout/tickets?q=webhook")).body,
    );
    const closed = ticketPageSchema.parse(
      (await getJson(app, "/api/projects/checkout/tickets?q=webhook&status=closed")).body,
    );

    expect(all.totalItems).toBe(12);
    expect(closed.totalItems).toBe(8);
    expect(closed.items).toHaveLength(8);
  });

  it("searches for the word and, rather than the FTS operator", async () => {
    const { app } = createTestApp();

    const response = await getJson(app, "/api/projects/checkout/tickets?q=AND");

    expect(response.status).toBe(200);
    const page = ticketPageSchema.parse(response.body);
    expect(page.totalItems).toBe(98);
    expect(page.items).toHaveLength(25);
  });

  it.each(["q=%22", "q=-", "q=*", "q=()"])(
    "returns no tickets for %s instead of failing",
    async (query) => {
      const { app } = createTestApp();

      const response = await getJson(app, `/api/projects/checkout/tickets?${query}`);

      expect(response.status).toBe(200);
      const page = ticketPageSchema.parse(response.body);
      expect(page.totalItems).toBe(0);
      expect(page.items).toEqual([]);
    },
  );

  it("treats a blank search as no search", async () => {
    const { app } = createTestApp();

    const response = await getJson(app, "/api/projects/checkout/tickets?q=%20%20");

    expect(response.status).toBe(200);
    const page = ticketPageSchema.parse(response.body);
    expect(page.totalItems).toBe(105);
    expect(page.items.every((ticket) => ticket.snippet === undefined)).toBe(true);
  });

  it("rejects a search longer than 100 characters", async () => {
    const { app } = createTestApp();

    const response = await getJson(app, `/api/projects/checkout/tickets?q=${"a".repeat(101)}`);

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({ error: { code: "validation_error" } });
  });

  it("stays inside the project", async () => {
    const { app } = createTestApp();

    const response = await getJson(app, "/api/projects/internal-tools/tickets?q=saml");

    const page = ticketPageSchema.parse(response.body);
    expect(page.items.map((ticket) => ticket.id).toSorted()).toEqual(["INT-115", "INT-129"]);
  });

  it("hides a project the user cannot see", async () => {
    const { app } = createTestApp();

    const hidden = await getJson(app, "/api/projects/billing/tickets?q=invoice");
    const missing = await getJson(app, "/api/projects/unknown/tickets?q=invoice");

    expect(hidden).toEqual({
      status: 404,
      body: { error: { code: "not_found", message: 'Project "billing" was not found.' } },
    });
    expect(missing).toEqual({
      status: 404,
      body: { error: { code: "not_found", message: 'Project "unknown" was not found.' } },
    });
  });
});
