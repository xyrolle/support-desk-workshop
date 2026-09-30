import type { ProjectMember, ProjectRole } from "@support-desk/shared";
import { and, asc, count, eq, getTableColumns } from "drizzle-orm";
import type { AppDatabase } from "../../db/client.ts";
import { projectMembers, users } from "../../db/schema.ts";

function selectMembers(database: AppDatabase) {
  return database
    .select({ ...getTableColumns(users), role: projectMembers.role })
    .from(projectMembers)
    .innerJoin(users, eq(users.id, projectMembers.userId));
}

export function findProjectMembers(database: AppDatabase, projectId: string): ProjectMember[] {
  return selectMembers(database)
    .where(eq(projectMembers.projectId, projectId))
    .orderBy(asc(users.name))
    .all();
}

export function findProjectMember(
  database: AppDatabase,
  projectId: string,
  userId: string,
): ProjectMember | undefined {
  return selectMembers(database)
    .where(and(eq(projectMembers.projectId, projectId), eq(projectMembers.userId, userId)))
    .get();
}

export function countProjectAdmins(database: AppDatabase, projectId: string): number {
  const result = database
    .select({ total: count() })
    .from(projectMembers)
    .where(and(eq(projectMembers.projectId, projectId), eq(projectMembers.role, "admin")))
    .get();
  return result?.total ?? 0;
}

export function insertProjectMember(
  database: AppDatabase,
  projectId: string,
  userId: string,
  role: ProjectRole,
): void {
  database.insert(projectMembers).values({ projectId, userId, role }).run();
}

export function updateProjectMemberRole(
  database: AppDatabase,
  projectId: string,
  userId: string,
  role: ProjectRole,
): void {
  database
    .update(projectMembers)
    .set({ role })
    .where(and(eq(projectMembers.projectId, projectId), eq(projectMembers.userId, userId)))
    .run();
}

export function deleteProjectMember(database: AppDatabase, projectId: string, userId: string) {
  database
    .delete(projectMembers)
    .where(and(eq(projectMembers.projectId, projectId), eq(projectMembers.userId, userId)))
    .run();
}
