import { ticketListQuerySchema } from "@support-desk/shared";
import { Hono } from "hono";
import type { AppEnv } from "../../http/app-env.ts";
import { validate } from "../../http/validation.ts";
import { listProjectTickets } from "./tickets.service.ts";

export const ticketRoutes = new Hono<AppEnv>().get(
  "/:projectId/tickets",
  validate("query", ticketListQuerySchema),
  (c) => {
    const page = listProjectTickets(
      c.var.database,
      c.var.currentUser,
      c.req.param("projectId"),
      c.req.valid("query"),
    );
    return c.json(page);
  },
);
