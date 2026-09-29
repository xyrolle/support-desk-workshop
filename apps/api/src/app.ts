import { Hono } from "hono";
import { currentUser } from "./auth/current-user.ts";
import type { AppDatabase } from "./db/client.ts";
import type { AppEnv } from "./http/app-env.ts";
import { handleError, handleNotFound } from "./http/errors.ts";
import { projectRoutes } from "./modules/projects/projects.routes.ts";
import { ticketRoutes } from "./modules/tickets/tickets.routes.ts";
import { currentUserRoutes } from "./modules/users/users.routes.ts";

type AppOptions = {
  database: AppDatabase;
  currentUserId: string;
};

export function createApp({ database, currentUserId }: AppOptions) {
  const app = new Hono<AppEnv>();

  app.use(async (c, next) => {
    c.set("database", database);
    await next();
  });
  app.use(currentUser(currentUserId));

  app.get("/api/health", (c) => c.json({ status: "ok" }));
  app.route("/api/me", currentUserRoutes);
  app.route("/api/projects", projectRoutes);
  app.route("/api/projects", ticketRoutes);

  app.notFound(handleNotFound);
  app.onError(handleError);

  return app;
}
