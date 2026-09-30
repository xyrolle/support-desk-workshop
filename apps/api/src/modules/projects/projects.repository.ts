import type { ProjectRole } from "@support-desk/shared";
import { and, asc, eq, getTableColumns } from "drizzle-orm";
import type { AppDatabase } from "../../db/client.ts";
import { type ProjectRow, projectMembers, projects } from "../../db/schema.ts";

/** A project together with one member's role in it. */
export type MemberProjectRow = {
  project: ProjectRow;
  role: ProjectRole;
};

function selectMemberProjects(database: AppDatabase) {
  return database
    .select({ project: getTableColumns(projects), role: projectMembers.role })
    .from(projects)
    .innerJoin(projectMembers, eq(projectMembers.projectId, projects.id));
}

export function findMemberProjects(database: AppDatabase, userId: string): MemberProjectRow[] {
  return selectMemberProjects(database)
    .where(eq(projectMembers.userId, userId))
    .orderBy(asc(projects.name))
    .all();
}

export function findMemberProject(
  database: AppDatabase,
  projectId: string,
  userId: string,
): MemberProjectRow | undefined {
  return selectMemberProjects(database)
    .where(and(eq(projects.id, projectId), eq(projectMembers.userId, userId)))
    .get();
}
