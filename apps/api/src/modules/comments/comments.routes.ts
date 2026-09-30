import { newCommentSchema } from "@support-desk/shared";
import { Hono } from "hono";
import type { AppEnv } from "../../http/app-env.ts";
import { validate } from "../../http/validation.ts";
import { addComment, listComments } from "./comments.service.ts";

export const commentRoutes = new Hono<AppEnv>()
  .get("/:projectId/tickets/:ticketId/comments", (c) => {
    const { projectId, ticketId } = c.req.param();
    return c.json(listComments(c.var.context, projectId, ticketId));
  })
  .post("/:projectId/tickets/:ticketId/comments", validate("json", newCommentSchema), (c) => {
    const { projectId, ticketId } = c.req.param();
    const comment = addComment(c.var.context, projectId, ticketId, c.req.valid("json"));
    return c.json(comment, 201);
  });
