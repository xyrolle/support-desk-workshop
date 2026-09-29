import { createApp } from "../app.ts";
import { IN_MEMORY_DATABASE, openDatabase } from "../db/client.ts";
import { seedDatabase } from "../db/seed.ts";

/** The seed's timestamps are relative to this date in every test. */
export const TEST_REFERENCE_DATE = new Date("2026-03-02T09:00:00.000Z");

/** Maya Chen: member of Checkout and Mobile App, not of Internal Tools. */
export const DEMO_USER_ID = "maya-chen";

/** A fresh in-memory database with the demo data, and an app wired to it. */
export function createTestApp(currentUserId = DEMO_USER_ID) {
  const database = openDatabase(IN_MEMORY_DATABASE);
  seedDatabase(database, TEST_REFERENCE_DATE);
  const app = createApp({ database, currentUserId });
  return { app, database };
}

type TestApp = ReturnType<typeof createTestApp>["app"];

export async function getJson(app: TestApp, path: string) {
  const response = await app.request(path);
  const body: unknown = await response.json();
  return { status: response.status, body };
}
