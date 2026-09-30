import {
  type Project,
  type ProjectPermissions,
  type ProjectRole,
  roleNames,
} from "@support-desk/shared";
import { ForbiddenError, NotFoundError } from "../http/errors.ts";
import {
  findMemberProject,
  findMemberProjects,
  type MemberProjectRow,
} from "../modules/projects/projects.repository.ts";
import type { RequestContext } from "../request-context.ts";

// The access policy of Support Desk, and the only place that decides who may
// see or change what. Every service calls it before it touches project data.
//
// - Members see their projects. A hidden project and a missing one give the
//   same 404, so the API never reveals which projects exist.
// - Viewers can read; agents also work on tickets; admins also manage members.
//   A member without the permission gets a 403.

export type ProjectAction = keyof ProjectPermissions;

const permissionsByRole: Record<ProjectRole, ProjectPermissions> = {
  viewer: { editTickets: false, manageMembers: false },
  agent: { editTickets: true, manageMembers: false },
  admin: { editTickets: true, manageMembers: true },
};

const actionDescriptions: Record<ProjectAction, string> = {
  editTickets: "change or comment on tickets",
  manageMembers: "manage members",
};

export function permissionsFor(role: ProjectRole): ProjectPermissions {
  return permissionsByRole[role];
}

/** The projects the current user is a member of, sorted by name. */
export function listVisibleProjects(context: RequestContext): Project[] {
  return findMemberProjects(context.database, context.user.id).map(toProject);
}

/** Ids of the projects the current user can see. Scope every cross-project query with them. */
export function visibleProjectIds(context: RequestContext): string[] {
  return listVisibleProjects(context).map((project) => project.id);
}

/**
 * Returns the project if the current user may see it and, when an action is
 * given, do that action in it. Throws a 404 or a 403 otherwise.
 */
export function authorize(
  context: RequestContext,
  projectId: string,
  action?: ProjectAction,
): Project {
  const row = findMemberProject(context.database, projectId, context.user.id);
  if (!row) {
    throw new NotFoundError(`Project "${projectId}" was not found.`);
  }

  const project = toProject(row);
  if (action && !project.permissions[action]) {
    throw new ForbiddenError(
      `${roleNames[project.role]}s of ${project.name} cannot ${actionDescriptions[action]}.`,
    );
  }
  return project;
}

function toProject({ project, role }: MemberProjectRow): Project {
  return { ...project, role, permissions: permissionsFor(role) };
}
