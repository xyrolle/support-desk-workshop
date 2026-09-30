import type { User } from "@support-desk/shared";
import type { AppDatabase } from "./db/client.ts";
import type { Clock } from "./lib/dates.ts";

/** Who is acting, on which database, and what time it is. Every service function takes one. */
export type RequestContext = {
  database: AppDatabase;
  user: User;
  clock: Clock;
};
