import { newSavedViewSchema } from "@support-desk/shared";
import { Hono } from "hono";
import type { AppEnv } from "../../http/app-env.ts";
import { validate } from "../../http/validation.ts";
import { createView, listViews } from "./views.service.ts";

export const viewRoutes = new Hono<AppEnv>()
  .get("/:projectId/views", (c) => {
    return c.json(listViews(c.var.context, c.req.param("projectId")));
  })
  .post("/:projectId/views", validate("json", newSavedViewSchema), (c) => {
    const view = createView(c.var.context, c.req.param("projectId"), c.req.valid("json"));
    return c.json(view, 201);
  });
