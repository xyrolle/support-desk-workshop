import { ticketListQuerySchema } from "@support-desk/shared";
import { Hono } from "hono";
import type { AppEnv } from "../../http/app-env.ts";
import { validate } from "../../http/validation.ts";
import { getOrganization, listOrganizationTickets } from "./customers.service.ts";

export const organizationRoutes = new Hono<AppEnv>()
  .get("/:organizationId", (c) => {
    return c.json(getOrganization(c.var.context, c.req.param("organizationId")));
  })
  .get("/:organizationId/tickets", validate("query", ticketListQuerySchema), (c) => {
    const page = listOrganizationTickets(
      c.var.context,
      c.req.param("organizationId"),
      c.req.valid("query"),
    );
    return c.json(page);
  });
