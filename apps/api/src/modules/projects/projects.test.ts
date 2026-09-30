import { projectSchema } from "@support-desk/shared";
import { describe, expect, it } from "vitest";
import { createTestApp, getJson, VIEWER_USER_ID } from "../../test/test-app.ts";

describe("GET /api/projects", () => {
  it("lists the current user's projects with their role and permissions", async () => {
    const { app } = createTestApp();

    const response = await getJson(app, "/api/projects");

    expect(response.status).toBe(200);
    const projects = projectSchema.array().parse(response.body);
    expect(projects.map(({ name, role, permissions }) => ({ name, role, permissions }))).toEqual([
      { name: "Checkout", role: "admin", permissions: { editTickets: true, manageMembers: true } },
      {
        name: "Internal Tools",
        role: "agent",
        permissions: { editTickets: true, manageMembers: false },
      },
      {
        name: "Mobile App",
        role: "agent",
        permissions: { editTickets: true, manageMembers: false },
      },
    ]);
  });

  it("shows a viewer that they can only read", async () => {
    const { app } = createTestApp(VIEWER_USER_ID);

    const response = await getJson(app, "/api/projects");

    const projects = projectSchema.array().parse(response.body);
    expect(projects.map((project) => project.role)).toEqual(["viewer", "viewer", "viewer"]);
    expect(projects.every((project) => !project.permissions.editTickets)).toBe(true);
  });
});

describe("GET /api/projects/:projectId", () => {
  it("returns a project the user belongs to", async () => {
    const { app } = createTestApp();

    const response = await getJson(app, "/api/projects/mobile-app");

    expect(response.status).toBe(200);
    expect(projectSchema.parse(response.body)).toMatchObject({
      key: "MOB",
      name: "Mobile App",
      timeZone: "America/New_York",
      role: "agent",
    });
  });

  it("returns the same 404 for a hidden project and a missing one", async () => {
    const { app } = createTestApp();

    const hidden = await getJson(app, "/api/projects/billing");
    const missing = await getJson(app, "/api/projects/unknown");

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
