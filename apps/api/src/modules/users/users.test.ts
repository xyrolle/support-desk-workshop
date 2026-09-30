import { userSchema } from "@support-desk/shared";
import { describe, expect, it } from "vitest";
import { createTestApp, getJson } from "../../test/test-app.ts";

describe("GET /api/me", () => {
  it("returns the demo user", async () => {
    const { app } = createTestApp();

    const response = await getJson(app, "/api/me");

    expect(response.status).toBe(200);
    expect(userSchema.parse(response.body)).toEqual({
      id: "maya-chen",
      name: "Maya Chen",
      initials: "MC",
      email: "maya.chen@brightcart.example",
      avatarColor: "violet",
    });
  });
});

describe("GET /api/users", () => {
  it("lists every teammate in the workspace by name", async () => {
    const { app } = createTestApp();

    const response = await getJson(app, "/api/users");

    const teammates = userSchema.array().parse(response.body);
    expect(teammates).toHaveLength(12);
    expect(teammates.slice(0, 3).map((teammate) => teammate.name)).toEqual([
      "Aisha Rahman",
      "Chloé Martin",
      "Diego Alvarez",
    ]);
  });
});
