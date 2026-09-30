import { z } from "zod";
import { projectRoleSchema } from "./projects.ts";
import { userSchema } from "./users.ts";

export const projectMemberSchema = userSchema.extend({
  role: projectRoleSchema,
});

export type ProjectMember = z.infer<typeof projectMemberSchema>;

/** Body of POST /api/projects/:projectId/members. */
export const newProjectMemberSchema = z.strictObject({
  userId: z.string().min(1),
  role: projectRoleSchema,
});

export type NewProjectMember = z.infer<typeof newProjectMemberSchema>;

/** Body of PATCH /api/projects/:projectId/members/:userId. */
export const projectMemberChangesSchema = z.strictObject({
  role: projectRoleSchema,
});

export type ProjectMemberChanges = z.infer<typeof projectMemberChangesSchema>;
