import { describe, expect, it } from "vitest";
import { NotFoundError } from "../http/errors.ts";
import { findUserById } from "../modules/users/users.repository.ts";
import { createTestApp } from "../test/test-app.ts";
import { listAccessibleProjects, requireProjectAccess } from "./access.ts";

function setup(userId: string) {
  const { database } = createTestApp(userId);
  const user = findUserById(database, userId);
  if (!user) {
    throw new Error(`Seed user "${userId}" is missing`);
  }
  return { database, user };
}

describe("listAccessibleProjects", () => {
  it("returns only the projects the user is a member of", () => {
    const { database, user } = setup("maya-chen");

    const projects = listAccessibleProjects(database, user);

    expect(projects.map((project) => project.id)).toEqual(["checkout", "mobile-app"]);
  });
});

describe("requireProjectAccess", () => {
  it("returns the project when the user is a member", () => {
    const { database, user } = setup("maya-chen");

    const project = requireProjectAccess(database, user, "checkout");

    expect(project.name).toBe("Checkout");
  });

  it("throws NotFoundError when the user is not a member", () => {
    const { database, user } = setup("maya-chen");

    expect(() => requireProjectAccess(database, user, "internal-tools")).toThrow(NotFoundError);
  });

  it("throws NotFoundError when the project does not exist", () => {
    const { database, user } = setup("maya-chen");

    expect(() => requireProjectAccess(database, user, "unknown")).toThrow(NotFoundError);
  });

  it("follows membership, not a hard-coded list", () => {
    const { database, user } = setup("tomas-silva");

    expect(requireProjectAccess(database, user, "internal-tools").name).toBe("Internal Tools");
    expect(() => requireProjectAccess(database, user, "checkout")).toThrow(NotFoundError);
  });
});
