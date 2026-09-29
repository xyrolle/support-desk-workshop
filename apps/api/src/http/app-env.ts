import type { User } from "@support-desk/shared";
import type { AppDatabase } from "../db/client.ts";

/** Values every request handler can read from `c.var`. */
export type AppEnv = {
  Variables: {
    database: AppDatabase;
    currentUser: User;
  };
};
