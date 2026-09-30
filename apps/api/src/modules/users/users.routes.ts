import { Hono } from "hono";
import type { AppEnv } from "../../http/app-env.ts";
import { listTeammates } from "./users.service.ts";

export const userRoutes = new Hono<AppEnv>()
  .get("/me", (c) => {
    return c.json(c.var.context.user);
  })
  .get("/users", (c) => {
    return c.json(listTeammates(c.var.context));
  });
