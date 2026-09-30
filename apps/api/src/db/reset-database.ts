import path from "node:path";
import { config } from "../config.ts";
import { deleteDatabaseFile, openDatabase } from "./client.ts";
import { seedDatabase } from "./seed.ts";

// Starts from an empty file, so the reset also works after switching to a
// branch with different migrations.
deleteDatabaseFile(config.databaseFile);
const database = openDatabase(config.databaseFile);
const summary = seedDatabase(database);
const location = path.relative(process.cwd(), config.databaseFile);

console.log(
  `Seeded ${summary.users} teammates, ${summary.organizations} customers, ${summary.tickets} tickets and ${summary.comments} comments into ${location}`,
);
