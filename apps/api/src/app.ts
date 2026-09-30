import { Hono } from "hono";
import { currentUser } from "./auth/current-user.ts";
import type { AppDatabase } from "./db/client.ts";
import type { AppEnv } from "./http/app-env.ts";
import { handleError, handleNotFound } from "./http/errors.ts";
import type { Clock } from "./lib/dates.ts";
import { activityRoutes } from "./modules/activity/activity.routes.ts";
import { labelRoutes } from "./modules/labels/labels.routes.ts";
import { projectRoutes } from "./modules/projects/projects.routes.ts";
import { myTicketRoutes, ticketRoutes } from "./modules/tickets/tickets.routes.ts";
import { userRoutes } from "./modules/users/users.routes.ts";

type AppOptions = {
  database: AppDatabase;
  clock: Clock;
  currentUserId: string;
};

export function createApp(options: AppOptions) {
  const app = new Hono<AppEnv>();

  app.get("/api/health", (c) => c.json({ status: "ok" }));

  app.use("/api/*", currentUser(options));
  app.route("/api", userRoutes);
  app.route("/api/me/tickets", myTicketRoutes);
  app.route("/api/projects", projectRoutes);
  app.route("/api/projects", labelRoutes);
  app.route("/api/projects", ticketRoutes);
  app.route("/api/projects", activityRoutes);

  app.notFound(handleNotFound);
  app.onError(handleError);

  return app;
}
