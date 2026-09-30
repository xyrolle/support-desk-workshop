import type { User } from "@support-desk/shared";
import { asc, eq } from "drizzle-orm";
import type { AppDatabase } from "../../db/client.ts";
import { users } from "../../db/schema.ts";

export function findUserById(database: AppDatabase, userId: string): User | undefined {
  return database.select().from(users).where(eq(users.id, userId)).get();
}

export function findAllUsers(database: AppDatabase): User[] {
  return database.select().from(users).orderBy(asc(users.name)).all();
}
