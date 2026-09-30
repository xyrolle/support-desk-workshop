import { describe, expect, it } from "vitest";
import { ForbiddenError, NotFoundError } from "../http/errors.ts";
import { createTestContext, VIEWER_USER_ID } from "../test/test-app.ts";
import { authorize, listVisibleProjects, permissionsFor, visibleProjectIds } from "./policy.ts";

describe("permissionsFor", () => {
  it.each([
    ["viewer", { editTickets: false, manageMembers: false }],
    ["agent", { editTickets: true, manageMembers: false }],
    ["admin", { editTickets: true, manageMembers: true }],
  ] as const)("gives a %s %o", (role, permissions) => {
    expect(permissionsFor(role)).toEqual(permissions);
  });
});

describe("listVisibleProjects", () => {
  it("returns the user's projects by name, with their role in each", () => {
    const context = createTestContext();

    const projects = listVisibleProjects(context);

    expect(projects.map((project) => [project.name, project.role])).toEqual([
      ["Checkout", "admin"],
      ["Internal Tools", "agent"],
      ["Mobile App", "agent"],
    ]);
  });

  it("follows membership, not a hard-coded list", () => {
    const context = createTestContext(VIEWER_USER_ID);

    expect(visibleProjectIds(context)).toEqual(["billing", "checkout", "mobile-app"]);
  });
});

describe("authorize", () => {
  it("returns the project with the user's role and permissions", () => {
    const context = createTestContext();

    const project = authorize(context, "mobile-app");

    expect(project).toMatchObject({
      name: "Mobile App",
      timeZone: "America/New_York",
      role: "agent",
      permissions: { editTickets: true, manageMembers: false },
    });
  });

  it("allows an action the user's role permits", () => {
    const context = createTestContext();

    expect(authorize(context, "checkout", "manageMembers").name).toBe("Checkout");
  });

  it("hides a project the user is not a member of behind the same 404 as a missing one", () => {
    const context = createTestContext();

    expect(() => authorize(context, "billing")).toThrow(
      new NotFoundError('Project "billing" was not found.'),
    );
    expect(() => authorize(context, "unknown")).toThrow(
      new NotFoundError('Project "unknown" was not found.'),
    );
  });

  it("checks membership before the action, so a hidden project never gives a 403", () => {
    const context = createTestContext();

    expect(() => authorize(context, "billing", "manageMembers")).toThrow(NotFoundError);
  });

  it("forbids viewers to change tickets", () => {
    const context = createTestContext(VIEWER_USER_ID);

    expect(() => authorize(context, "checkout", "editTickets")).toThrow(
      new ForbiddenError("Viewers of Checkout cannot change or comment on tickets."),
    );
  });

  it("forbids agents to manage members", () => {
    const context = createTestContext();

    expect(() => authorize(context, "mobile-app", "manageMembers")).toThrow(
      new ForbiddenError("Agents of Mobile App cannot manage members."),
    );
  });
});
