import { createMiddleware } from "hono/factory";
import type { AppDatabase } from "../db/client.ts";
import type { AppEnv } from "../http/app-env.ts";
import type { Clock } from "../lib/dates.ts";
import { findUserById } from "../modules/users/users.repository.ts";

type CurrentUserOptions = {
  database: AppDatabase;
  clock: Clock;
  currentUserId: string;
};

/**
 * Support Desk has NO real authentication. Every request acts as one fixed
 * demo user, set with the DEMO_USER_ID environment variable (Maya Chen by
 * default). This keeps the workshop focused; it is not a security model.
 */
export function currentUser({ database, clock, currentUserId }: CurrentUserOptions) {
  return createMiddleware<AppEnv>(async (c, next) => {
    const user = findUserById(database, currentUserId);
    if (!user) {
      throw new Error(`Demo user "${currentUserId}" does not exist. Run "npm run db:seed".`);
    }

    c.set("context", { database, user, clock });
    await next();
  });
}
