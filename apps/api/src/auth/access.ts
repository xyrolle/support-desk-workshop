import type { Project, User } from "@support-desk/shared";
import type { AppDatabase } from "../db/client.ts";
import { NotFoundError } from "../http/errors.ts";
import {
  findProjectForMember,
  findProjectsForMember,
} from "../modules/projects/projects.repository.ts";

// The access rule for Support Desk: a user can only see the projects they are a
// member of. Every route that touches a project goes through this file.

/** The projects the user is a member of, sorted by name. */
export function listAccessibleProjects(database: AppDatabase, user: User): Project[] {
  return findProjectsForMember(database, user.id);
}

/**
 * Returns the project, or throws a 404. A project the user cannot see and a
 * project that does not exist produce the same error, so the API never
 * reveals which projects exist.
 */
export function requireProjectAccess(
  database: AppDatabase,
  user: User,
  projectId: string,
): Project {
  const project = findProjectForMember(database, projectId, user.id);
  if (!project) {
    throw new NotFoundError(`Project "${projectId}" was not found.`);
  }
  return project;
}
