import type { ProjectMember } from "@support-desk/shared";
import { and, eq, getTableColumns } from "drizzle-orm";
import type { AppDatabase } from "../../db/client.ts";
import { projectMembers, users } from "../../db/schema.ts";

function selectMembers(database: AppDatabase) {
  return database
    .select({ ...getTableColumns(users), role: projectMembers.role })
    .from(projectMembers)
    .innerJoin(users, eq(users.id, projectMembers.userId));
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
