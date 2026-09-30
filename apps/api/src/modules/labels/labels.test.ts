import { labelSchema } from "@support-desk/shared";
import { describe, expect, it } from "vitest";
import { createTestApp, getJson } from "../../test/test-app.ts";

describe("GET /api/projects/:projectId/labels", () => {
  it("returns the project's labels by name", async () => {
    const { app } = createTestApp();

    const response = await getJson(app, "/api/projects/mobile-app/labels");

    expect(response.status).toBe(200);
    const labels = labelSchema.array().parse(response.body);
    expect(labels.map((label) => label.name)).toEqual([
      "Android",
      "App review",
      "Bug",
      "Crash",
      "Feature request",
      "iOS",
      "Login",
      "Push notifications",
      "Question",
    ]);
  });

  it("returns the usual 404 for a hidden project", async () => {
    const { app } = createTestApp();

    const response = await getJson(app, "/api/projects/billing/labels");

    expect(response.status).toBe(404);
  });
});
