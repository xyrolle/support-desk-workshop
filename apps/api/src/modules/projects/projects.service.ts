import type { Project, User } from "@support-desk/shared";
import { listAccessibleProjects, requireProjectAccess } from "../../auth/access.ts";
import type { AppDatabase } from "../../db/client.ts";

export function listProjects(database: AppDatabase, user: User): Project[] {
  return listAccessibleProjects(database, user);
}

export function getProject(database: AppDatabase, user: User, projectId: string): Project {
  return requireProjectAccess(database, user, projectId);
}
