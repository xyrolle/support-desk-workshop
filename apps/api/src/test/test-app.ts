import { createApp } from "../app.ts";
import { type AppDatabase, IN_MEMORY_DATABASE, openDatabase } from "../db/client.ts";
import { seedDatabase } from "../db/seed.ts";
import type { Clock } from "../lib/dates.ts";
import { findUserById } from "../modules/users/users.repository.ts";
import type { RequestContext } from "../request-context.ts";

/** The seed's timestamps are relative to this date, and the test clock always says it is now. */
export const TEST_NOW = new Date("2026-09-29T13:00:00.000Z");

/** Maya Chen: admin of Checkout, agent in Mobile App and Internal Tools, not in Billing. */
export const DEMO_USER_ID = "maya-chen";

/** Ravi Patel: an account manager who is a viewer in Checkout, Mobile App and Billing. */
export const VIEWER_USER_ID = "ravi-patel";

export const testClock: Clock = { now: () => TEST_NOW };

/** A fresh in-memory database with the demo data, and an app wired to it. */
export function createTestApp(currentUserId = DEMO_USER_ID) {
  const database = createTestDatabase();
  const app = createApp({ database, clock: testClock, currentUserId });
  return { app, database };
}

export function createTestDatabase(): AppDatabase {
  const database = openDatabase(IN_MEMORY_DATABASE);
  seedDatabase(database, TEST_NOW);
  return database;
}

/** What a service sees when `userId` makes a request, for tests below the HTTP layer. */
export function createTestContext(userId = DEMO_USER_ID): RequestContext {
  const database = createTestDatabase();
  const user = findUserById(database, userId);
  if (!user) {
    throw new Error(`Seed user "${userId}" is missing.`);
  }
  return { database, user, clock: testClock };
}

export type TestApp = ReturnType<typeof createTestApp>["app"];

export type TestResponse = {
  status: number;
  body: unknown;
};

export async function getJson(app: TestApp, path: string): Promise<TestResponse> {
  return readJson(await app.request(path));
}

export async function sendJson(
  app: TestApp,
  method: "POST" | "PATCH" | "DELETE",
  path: string,
  body?: unknown,
): Promise<TestResponse> {
  const response = await app.request(path, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return readJson(response);
}

async function readJson(response: Response): Promise<TestResponse> {
  const text = await response.text();
  return { status: response.status, body: text ? JSON.parse(text) : null };
}
