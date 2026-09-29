import { Hono } from "hono";
import type { AppEnv } from "../../http/app-env.ts";

export const currentUserRoutes = new Hono<AppEnv>().get("/", (c) => {
  return c.json(c.var.currentUser);
});
