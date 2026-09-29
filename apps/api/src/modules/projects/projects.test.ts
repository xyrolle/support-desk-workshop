import { projectSchema } from "@support-desk/shared";
import { describe, expect, it } from "vitest";
import { createTestApp, getJson } from "../../test/test-app.ts";

describe("GET /api/projects", () => {
  it("lists only the projects the current user belongs to", async () => {
    const { app } = createTestApp();

    const response = await getJson(app, "/api/projects");

    expect(response.status).toBe(200);
    const projects = projectSchema.array().parse(response.body);
    expect(projects.map((project) => project.name)).toEqual(["Checkout", "Mobile App"]);
  });
});

describe("GET /api/projects/:projectId", () => {
  it("returns a project the user belongs to", async () => {
    const { app } = createTestApp();

    const response = await getJson(app, "/api/projects/mobile-app");

    expect(response.status).toBe(200);
    expect(projectSchema.parse(response.body)).toMatchObject({ key: "MOB", name: "Mobile App" });
  });

  it("returns the same 404 for a hidden project and a missing one", async () => {
    const { app } = createTestApp();

    const hidden = await getJson(app, "/api/projects/internal-tools");
    const missing = await getJson(app, "/api/projects/unknown");

    expect(hidden.status).toBe(404);
    expect(missing.status).toBe(404);
    expect(hidden.body).toEqual({
      error: { code: "not_found", message: 'Project "internal-tools" was not found.' },
    });
    expect(missing.body).toEqual({
      error: { code: "not_found", message: 'Project "unknown" was not found.' },
    });
  });
});
