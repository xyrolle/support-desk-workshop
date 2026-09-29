import { userSchema } from "@support-desk/shared";
import { describe, expect, it, vi } from "vitest";
import { createTestApp, getJson } from "./test/test-app.ts";

describe("app", () => {
  it("reports health", async () => {
    const { app } = createTestApp();

    const response = await getJson(app, "/api/health");

    expect(response).toEqual({ status: 200, body: { status: "ok" } });
  });

  it("returns the demo user from /api/me", async () => {
    const { app } = createTestApp();

    const response = await getJson(app, "/api/me");

    expect(userSchema.parse(response.body).name).toBe("Maya Chen");
  });

  it("answers unknown routes with the standard error body", async () => {
    const { app } = createTestApp();

    const response = await getJson(app, "/api/nope");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: { code: "not_found", message: "No route for GET /api/nope." },
    });
  });

  it("hides unexpected errors behind a generic 500", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { app } = createTestApp("someone-who-does-not-exist");

    const response = await getJson(app, "/api/projects");

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: { code: "internal_error", message: "Something went wrong on our side." },
    });
  });
});
