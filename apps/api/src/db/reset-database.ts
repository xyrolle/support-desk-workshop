import path from "node:path";
import { config } from "../config.ts";
import { openDatabase } from "./client.ts";
import { seedDatabase } from "./seed.ts";

const database = openDatabase(config.databaseFile);
const summary = seedDatabase(database);
const location = path.relative(process.cwd(), config.databaseFile);

console.log(
  `Seeded ${summary.projects} projects, ${summary.users} users and ${summary.tickets} tickets into ${location}`,
);
