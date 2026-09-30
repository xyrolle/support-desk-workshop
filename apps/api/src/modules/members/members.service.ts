import type {
  NewProjectMember,
  Project,
  ProjectMember,
  ProjectMemberChanges,
} from "@support-desk/shared";
import { authorize, permissionsFor } from "../../auth/policy.ts";
import { type AppDatabase, inTransaction } from "../../db/client.ts";
import { ConflictError, NotFoundError, ValidationError } from "../../http/errors.ts";
import type { RequestContext } from "../../request-context.ts";
import { releaseAssignedTickets } from "../tickets/tickets.service.ts";
import { findUserById } from "../users/users.repository.ts";
import {
  countProjectAdmins,
  deleteProjectMember,
  findProjectMember,
  findProjectMembers,
  insertProjectMember,
  updateProjectMemberRole,
} from "./members.repository.ts";

/** Every member can see who else is in the project, for example to assign tickets. */
export function listMembers(context: RequestContext, projectId: string): ProjectMember[] {
  authorize(context, projectId);
  return findProjectMembers(context.database, projectId);
}

export function addMember(
  context: RequestContext,
  projectId: string,
  { userId, role }: NewProjectMember,
): ProjectMember {
  const { database } = context;
  const project = authorize(context, projectId, "manageMembers");
  const user = findUserById(database, userId);
  if (!user) {
    throw new ValidationError(`userId: there is no teammate "${userId}".`);
  }
  if (findProjectMember(database, projectId, userId)) {
    throw new ConflictError(`${user.name} is already a member of ${project.name}.`);
  }

  insertProjectMember(database, projectId, userId, role);
  return requireMember(database, projectId, userId);
}

/** A member who becomes a viewer can no longer work on tickets, so theirs are unassigned. */
export function changeMemberRole(
  context: RequestContext,
  projectId: string,
  userId: string,
  { role }: ProjectMemberChanges,
): ProjectMember {
  const { database } = context;
  const project = authorize(context, projectId, "manageMembers");
  const member = requireMember(database, projectId, userId);
  if (member.role === "admin" && role !== "admin") {
    requireAnotherAdmin(database, project);
  }

  inTransaction(database, () => {
    updateProjectMemberRole(database, projectId, userId, role);
    if (!permissionsFor(role).editTickets) {
      releaseAssignedTickets(context, projectId, userId);
    }
  });
  return requireMember(database, projectId, userId);
}

/** The member's unresolved tickets in the project are unassigned. */
export function removeMember(context: RequestContext, projectId: string, userId: string): void {
  const { database } = context;
  const project = authorize(context, projectId, "manageMembers");
  const member = requireMember(database, projectId, userId);
  if (member.role === "admin") {
    requireAnotherAdmin(database, project);
  }

  inTransaction(database, () => {
    releaseAssignedTickets(context, projectId, userId);
    deleteProjectMember(database, projectId, userId);
  });
}

function requireMember(database: AppDatabase, projectId: string, userId: string): ProjectMember {
  const member = findProjectMember(database, projectId, userId);
  if (!member) {
    throw new NotFoundError(`Member "${userId}" was not found.`);
  }
  return member;
}

function requireAnotherAdmin(database: AppDatabase, project: Project): void {
  if (countProjectAdmins(database, project.id) <= 1) {
    throw new ConflictError(`${project.name} needs at least one admin.`);
  }
}
