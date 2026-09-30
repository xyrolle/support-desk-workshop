import { Hono } from "hono";
import type { AppEnv } from "../../http/app-env.ts";
import { getProject, listProjects } from "./projects.service.ts";

export const projectRoutes = new Hono<AppEnv>()
  .get("/", (c) => {
    return c.json(listProjects(c.var.context));
  })
  .get("/:projectId", (c) => {
    return c.json(getProject(c.var.context, c.req.param("projectId")));
  });
