import type { User } from "@support-desk/shared";
import { eq } from "drizzle-orm";
import type { AppDatabase } from "../../db/client.ts";
import { users } from "../../db/schema.ts";

export function findUserById(database: AppDatabase, userId: string): User | undefined {
  return database.select().from(users).where(eq(users.id, userId)).get();
}
