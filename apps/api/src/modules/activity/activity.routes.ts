import { Hono } from "hono";
import type { AppEnv } from "../../http/app-env.ts";
import { listActivity } from "./activity.service.ts";

export const activityRoutes = new Hono<AppEnv>().get(
  "/:projectId/tickets/:ticketId/activity",
  (c) => {
    const { projectId, ticketId } = c.req.param();
    return c.json(listActivity(c.var.context, projectId, ticketId));
  },
);
