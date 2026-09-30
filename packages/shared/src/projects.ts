import { z } from "zod";

/** Viewers can read a project; agents also work on its tickets; admins also manage members. */
export const projectRoles = ["viewer", "agent", "admin"] as const;

export const projectRoleSchema = z.enum(projectRoles);

export type ProjectRole = z.infer<typeof projectRoleSchema>;

/** What the current user may do in a project, derived from their role by the API's policy. */
export const projectPermissionsSchema = z.object({
  editTickets: z.boolean(),
  manageMembers: z.boolean(),
});

export type ProjectPermissions = z.infer<typeof projectPermissionsSchema>;

/** A project as the current user sees it: the API only returns projects they are a member of. */
export const projectSchema = z.object({
  id: z.string(),
  key: z.string(),
  name: z.string(),
  description: z.string(),
  /** IANA time zone the team works in, for anything measured in days or business hours. */
  timeZone: z.string(),
  role: projectRoleSchema,
  permissions: projectPermissionsSchema,
});

export type Project = z.infer<typeof projectSchema>;
