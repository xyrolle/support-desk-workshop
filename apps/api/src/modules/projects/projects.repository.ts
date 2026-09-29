import type { Project } from "@support-desk/shared";
import { and, asc, eq, getTableColumns } from "drizzle-orm";
import type { AppDatabase } from "../../db/client.ts";
import { projectMembers, projects } from "../../db/schema.ts";

const projectColumns = getTableColumns(projects);

export function findProjectsForMember(database: AppDatabase, userId: string): Project[] {
  return database
    .select(projectColumns)
    .from(projects)
    .innerJoin(projectMembers, eq(projectMembers.projectId, projects.id))
    .where(eq(projectMembers.userId, userId))
    .orderBy(asc(projects.name))
    .all();
}

export function findProjectForMember(
  database: AppDatabase,
  projectId: string,
  userId: string,
): Project | undefined {
  return database
    .select(projectColumns)
    .from(projects)
    .innerJoin(projectMembers, eq(projectMembers.projectId, projects.id))
    .where(and(eq(projects.id, projectId), eq(projectMembers.userId, userId)))
    .get();
}
