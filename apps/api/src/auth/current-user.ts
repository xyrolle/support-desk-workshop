import { createMiddleware } from "hono/factory";
import type { AppEnv } from "../http/app-env.ts";
import { findUserById } from "../modules/users/users.repository.ts";

/**
 * Support Desk has NO real authentication. Every request acts as one fixed
 * demo user, set with the DEMO_USER_ID environment variable (Maya Chen by
 * default). This keeps the workshop focused; it is not a security model.
 */
export function currentUser(userId: string) {
  return createMiddleware<AppEnv>(async (c, next) => {
    const user = findUserById(c.var.database, userId);
    if (!user) {
      throw new Error(`Demo user "${userId}" does not exist. Run "npm run db:seed".`);
    }

    c.set("currentUser", user);
    await next();
  });
}
