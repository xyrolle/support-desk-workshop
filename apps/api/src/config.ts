import path from "node:path";
import { z } from "zod";

const defaultDatabaseFile = path.join(import.meta.dirname, "..", "data", "support-desk.db");

const environmentSchema = z.object({
  PORT: z.coerce.number().int().positive().default(8787),
  DATABASE_FILE: z.string().min(1).default(defaultDatabaseFile),
  DEMO_USER_ID: z.string().min(1).default("maya-chen"),
});

const environment = environmentSchema.parse(process.env);

export const config = {
  port: environment.PORT,
  databaseFile: environment.DATABASE_FILE,
  demoUserId: environment.DEMO_USER_ID,
};
