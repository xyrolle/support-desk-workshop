import type { Project } from "@support-desk/shared";

/** Why the current user may not change this project's tickets, or `null` when they may. */
export function editTicketsBlockedReason(project: Project): string | null {
  if (project.permissions.editTickets) {
    return null;
  }
  return `You are a viewer in ${project.name}: you can read tickets but not change or answer them.`;
}
