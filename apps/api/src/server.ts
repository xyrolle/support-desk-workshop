import { serve } from "@hono/node-server";
import { createApp } from "./app.ts";
import { config } from "./config.ts";
import { openDatabase } from "./db/client.ts";
import { isDatabaseEmpty, seedDatabase } from "./db/seed.ts";
import { systemClock } from "./lib/dates.ts";

const database = openDatabase(config.databaseFile);

if (isDatabaseEmpty(database)) {
  seedDatabase(database);
  console.log("The database was empty, so it has been filled with demo data.");
}

const app = createApp({ database, clock: systemClock, currentUserId: config.demoUserId });

serve({ fetch: app.fetch, port: config.port }, ({ port }) => {
  console.log(`Support Desk API listening on http://localhost:${port}`);
});
