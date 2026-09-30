import type { Project } from "@support-desk/shared";

/** Why the current user may not change the project's members, or `null` when they may. */
export function manageMembersBlockedReason(project: Project): string | null {
  if (project.permissions.manageMembers) {
    return null;
  }
  return `Only admins of ${project.name} can add, change or remove members.`;
}
