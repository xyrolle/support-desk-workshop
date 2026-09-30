/*
 * LEGACY: see reports.service.ts. This route reads and checks its own query
 * string instead of using validate() and a shared zod schema.
 */
import { Hono } from "hono";
import { authorize } from "../../auth/policy.ts";
import type { AppEnv } from "../../http/app-env.ts";
import { ValidationError } from "../../http/errors.ts";
import { addDays, daysBetween, parseDay, today } from "./legacy-dates.ts";
import { buildVolumeReport } from "./reports.service.ts";

const DEFAULT_DAYS = 28;
const MAX_DAYS = 366;

export const reportRoutes = new Hono<AppEnv>().get("/:projectId/reports/volume", (c) => {
  const projectId = c.req.param("projectId");
  authorize(c.var.context, projectId);

  const to = c.req.query("to") ? parseDay(c.req.query("to")) : today();
  if (!to) {
    throw new ValidationError("to must be a date written as YYYY-MM-DD.");
  }
  const from = c.req.query("from") ? parseDay(c.req.query("from")) : addDays(to, 1 - DEFAULT_DAYS);
  if (!from) {
    throw new ValidationError("from must be a date written as YYYY-MM-DD.");
  }
  if (from > to) {
    throw new ValidationError("from must be on or before to.");
  }
  if (daysBetween(from, to) >= MAX_DAYS) {
    throw new ValidationError(`The report covers at most ${MAX_DAYS} days.`);
  }

  return c.json(buildVolumeReport(c.var.context.database, projectId, from, to));
});
