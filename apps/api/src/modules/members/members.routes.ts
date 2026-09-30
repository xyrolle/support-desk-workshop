import { newProjectMemberSchema, projectMemberChangesSchema } from "@support-desk/shared";
import { Hono } from "hono";
import type { AppEnv } from "../../http/app-env.ts";
import { validate } from "../../http/validation.ts";
import { addMember, changeMemberRole, listMembers, removeMember } from "./members.service.ts";

export const memberRoutes = new Hono<AppEnv>()
  .get("/:projectId/members", (c) => {
    return c.json(listMembers(c.var.context, c.req.param("projectId")));
  })
  .post("/:projectId/members", validate("json", newProjectMemberSchema), (c) => {
    const member = addMember(c.var.context, c.req.param("projectId"), c.req.valid("json"));
    return c.json(member, 201);
  })
  .patch("/:projectId/members/:userId", validate("json", projectMemberChangesSchema), (c) => {
    const { projectId, userId } = c.req.param();
    return c.json(changeMemberRole(c.var.context, projectId, userId, c.req.valid("json")));
  })
  .delete("/:projectId/members/:userId", (c) => {
    const { projectId, userId } = c.req.param();
    removeMember(c.var.context, projectId, userId);
    return c.body(null, 204);
  });
