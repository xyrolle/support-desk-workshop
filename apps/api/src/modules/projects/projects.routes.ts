import { Hono } from "hono";
import type { AppEnv } from "../../http/app-env.ts";
import { getProject, listProjects } from "./projects.service.ts";

export const projectRoutes = new Hono<AppEnv>()
  .get("/", (c) => {
    const projects = listProjects(c.var.database, c.var.currentUser);
    return c.json(projects);
  })
  .get("/:projectId", (c) => {
    const project = getProject(c.var.database, c.var.currentUser, c.req.param("projectId"));
    return c.json(project);
  });
