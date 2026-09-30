import { count } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { IN_MEMORY_DATABASE, inTransaction, openDatabase } from "./client.ts";
import { users } from "./schema.ts";

const teammate = {
  id: "ada-lovelace",
  name: "Ada Lovelace",
  initials: "AL",
  email: "ada@brightcart.example",
  avatarColor: "violet",
} as const;

describe("inTransaction", () => {
  it("saves every write when the work succeeds", () => {
    const database = openDatabase(IN_MEMORY_DATABASE);

    inTransaction(database, () => {
      database.insert(users).values(teammate).run();
    });

    expect(database.select({ total: count() }).from(users).get()?.total).toBe(1);
  });

  it("saves nothing when the work throws", () => {
    const database = openDatabase(IN_MEMORY_DATABASE);

    expect(() =>
      inTransaction(database, () => {
        database.insert(users).values(teammate).run();
        throw new Error("The second write failed.");
      }),
    ).toThrow("The second write failed.");

    expect(database.select({ total: count() }).from(users).get()?.total).toBe(0);
  });
});
