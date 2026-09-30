import { mkdirSync, rmSync } from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { type BetterSQLite3Database, drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import * as schema from "./schema.ts";

export const IN_MEMORY_DATABASE = ":memory:";

const migrationsFolder = path.join(import.meta.dirname, "migrations");

/** Drizzle over better-sqlite3; `$client` is the raw connection underneath. */
export type AppDatabase = BetterSQLite3Database<typeof schema> & { $client: Database.Database };

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

/** Deletes a database file and its write-ahead log, so the next open starts empty. */
export function deleteDatabaseFile(file: string): void {
  for (const suffix of ["", "-wal", "-shm"]) {
    rmSync(`${file}${suffix}`, { force: true });
  }
}

/**
 * Runs `work` in one transaction: every write in it is saved, or none is.
 * better-sqlite3 is synchronous and has a single connection, so every query
 * made on `database` while `work` runs is part of the transaction.
 */
export function inTransaction<Result>(database: AppDatabase, work: () => Result): Result {
  return database.$client.transaction(work)();
}
