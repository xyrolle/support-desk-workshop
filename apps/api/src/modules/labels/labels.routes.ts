import { Hono } from "hono";
import type { AppEnv } from "../../http/app-env.ts";
import { listLabels } from "./labels.service.ts";

export const labelRoutes = new Hono<AppEnv>().get("/:projectId/labels", (c) => {
  return c.json(listLabels(c.var.context, c.req.param("projectId")));
});
