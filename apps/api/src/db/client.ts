import { mkdirSync } from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { type BetterSQLite3Database, drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import * as schema from "./schema.ts";

export const IN_MEMORY_DATABASE = ":memory:";

const migrationsFolder = path.join(import.meta.dirname, "migrations");

export type AppDatabase = BetterSQLite3Database<typeof schema>;

/** Opens (or creates) a SQLite database and applies any pending migrations. */
export function openDatabase(file: string): AppDatabase {
  if (file !== IN_MEMORY_DATABASE) {
    mkdirSync(path.dirname(file), { recursive: true });
  }

  const sqlite = new Database(file);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");

  const database = drizzle({ client: sqlite, schema });
  migrate(database, { migrationsFolder });
  return database;
}
