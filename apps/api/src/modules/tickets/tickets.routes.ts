import {
  projectTicketListQuerySchema,
  ticketChangesSchema,
  ticketListQuerySchema,
} from "@support-desk/shared";
import { Hono } from "hono";
import type { AppEnv } from "../../http/app-env.ts";
import { validate } from "../../http/validation.ts";
import { getTicket, listMyTickets, listProjectTickets, updateTicket } from "./tickets.service.ts";

export const ticketRoutes = new Hono<AppEnv>()
  .get("/:projectId/tickets", validate("query", projectTicketListQuerySchema), (c) => {
    const page = listProjectTickets(c.var.context, c.req.param("projectId"), c.req.valid("query"));
    return c.json(page);
  })
  .get("/:projectId/tickets/:ticketId", (c) => {
    const { projectId, ticketId } = c.req.param();
    return c.json(getTicket(c.var.context, projectId, ticketId));
  })
  .patch("/:projectId/tickets/:ticketId", validate("json", ticketChangesSchema), (c) => {
    const { projectId, ticketId } = c.req.param();
    return c.json(updateTicket(c.var.context, projectId, ticketId, c.req.valid("json")));
  });

export const myTicketRoutes = new Hono<AppEnv>().get(
  "/",
  validate("query", ticketListQuerySchema),
  (c) => {
    return c.json(listMyTickets(c.var.context, c.req.valid("query")));
  },
);
