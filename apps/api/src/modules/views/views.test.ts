import { savedViewSchema } from "@support-desk/shared";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { createApp } from "../../app.ts";
import {
  createTestApp,
  createTestDatabase,
  DEMO_USER_ID,
  getJson,
  sendJson,
  testClock,
  VIEWER_USER_ID,
} from "../../test/test-app.ts";

const savedViewsSchema = z.array(savedViewSchema);

describe("GET /api/projects/:projectId/views", () => {
  it("returns no views until the current user saves one", async () => {
    const { app } = createTestApp();

    const response = await getJson(app, "/api/projects/checkout/views");

    expect(response.status).toBe(200);
    expect(savedViewsSchema.parse(response.body)).toEqual([]);
  });

  it("returns the same 404 for a hidden project and a missing one", async () => {
    const { app } = createTestApp();

    const hidden = await getJson(app, "/api/projects/billing/views");
    const missing = await getJson(app, "/api/projects/unknown/views");

    expect(hidden).toEqual({
      status: 404,
      body: { error: { code: "not_found", message: 'Project "billing" was not found.' } },
    });
    expect(missing.status).toBe(404);
  });

  it("hides another member's views", async () => {
    const database = createTestDatabase();
    const ravi = createApp({ database, clock: testClock, currentUserId: VIEWER_USER_ID });
    const maya = createApp({ database, clock: testClock, currentUserId: DEMO_USER_ID });

    const created = await sendJson(ravi, "POST", "/api/projects/checkout/views", {
      name: "Ravi's queue",
      filters: { status: ["open"] },
    });
    expect(created.status).toBe(201);

    const response = await getJson(maya, "/api/projects/checkout/views");

    expect(response.status).toBe(200);
    expect(savedViewsSchema.parse(response.body)).toEqual([]);
  });

  it("lists the owner's views by name", async () => {
    const { app } = createTestApp();
    await sendJson(app, "POST", "/api/projects/checkout/views", {
      name: "Zebra",
      filters: { priority: ["urgent"] },
    });
    await sendJson(app, "POST", "/api/projects/checkout/views", {
      name: "alpha",
      filters: { assignee: ["me"] },
    });

    const response = await getJson(app, "/api/projects/checkout/views");

    expect(savedViewsSchema.parse(response.body).map((view) => view.name)).toEqual([
      "alpha",
      "Zebra",
    ]);
  });
});

describe("POST /api/projects/:projectId/views", () => {
  it("saves a trimmed name and the filters, and reads them back validated", async () => {
    const { app } = createTestApp();
    const filters = { status: ["open", "blocked"], assignee: ["me"], label: [4] };

    const created = await sendJson(app, "POST", "/api/projects/checkout/views", {
      name: "  Urgent  ",
      filters,
    });

    expect(created.status).toBe(201);
    expect(savedViewSchema.parse(created.body)).toMatchObject({ name: "Urgent", filters });

    const listed = await getJson(app, "/api/projects/checkout/views");
    expect(savedViewsSchema.parse(listed.body)).toEqual([savedViewSchema.parse(created.body)]);
  });

  it("rejects a duplicate name among the user's views", async () => {
    const { app } = createTestApp();
    await sendJson(app, "POST", "/api/projects/checkout/views", {
      name: "Urgent",
      filters: { priority: ["urgent"] },
    });

    const again = await sendJson(app, "POST", "/api/projects/checkout/views", {
      name: "Urgent",
      filters: { status: ["open"] },
    });

    expect(again).toEqual({
      status: 409,
      body: { error: { code: "conflict", message: 'You already have a view called "Urgent".' } },
    });
  });

  it("lets a viewer save a private view", async () => {
    const { app } = createTestApp(VIEWER_USER_ID);

    const created = await sendJson(app, "POST", "/api/projects/checkout/views", {
      name: "Mine",
      filters: { assignee: ["unassigned"] },
    });

    expect(created.status).toBe(201);
    const listed = await getJson(app, "/api/projects/checkout/views");
    expect(savedViewsSchema.parse(listed.body)).toHaveLength(1);
  });

  it("returns the same 404 for a hidden project and a missing one", async () => {
    const { app } = createTestApp();
    const body = { name: "Hidden", filters: {} };

    const hidden = await sendJson(app, "POST", "/api/projects/billing/views", body);
    const missing = await sendJson(app, "POST", "/api/projects/unknown/views", body);

    expect(hidden).toEqual({
      status: 404,
      body: { error: { code: "not_found", message: 'Project "billing" was not found.' } },
    });
    expect(missing.status).toBe(404);
  });

  it("rejects a label from another project", async () => {
    const { app } = createTestApp();

    const response = await sendJson(app, "POST", "/api/projects/checkout/views", {
      name: "Wrong label",
      filters: { label: [10] },
    });

    expect(response).toEqual({
      status: 400,
      body: {
        error: { code: "validation_error", message: "label: 10 is not a label of this project." },
      },
    });
  });

  it.each([
    { name: "   ", filters: {} },
    { name: "x".repeat(61), filters: {} },
    { name: "Broken", filters: { status: ["done"] } },
  ])("rejects %j", async (body) => {
    const { app } = createTestApp();

    const response = await sendJson(app, "POST", "/api/projects/checkout/views", body);

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({ error: { code: "validation_error" } });
  });
});
