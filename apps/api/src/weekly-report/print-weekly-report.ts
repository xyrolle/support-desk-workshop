import { writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { config } from "../config.ts";
import { openDatabase } from "../db/client.ts";
import { isDatabaseEmpty, seedDatabase } from "../db/seed.ts";
import { type Clock, systemClock, utcDate } from "../lib/dates.ts";
import { findUserById } from "../modules/users/users.repository.ts";
import { buildWeeklyReport } from "./build-weekly-report.ts";
import { loadWeeklyData } from "./load-weekly-data.ts";

const usage = "Usage: npm run report:weekly -- [--as-of YYYY-MM-DD] [--out file.md]\n";

export type WeeklyReportIo = {
  stdout: (text: string) => void;
  stderr: (text: string) => void;
  writeFile: (file: string, text: string) => void;
  clock: Clock;
  /** Builds the Markdown for the week ending on `asOf` (`YYYY-MM-DD`). */
  reportFor: (asOf: string) => string;
};

type WeeklyReportArgs = {
  asOf: string | undefined;
  out: string | undefined;
};

/** Prints or writes the weekly report. Returns a process exit code. */
export function runWeeklyReport(argv: string[], io: WeeklyReportIo): number {
  const args = parseArgs(argv);
  if (!args) {
    io.stderr(usage);
    return 1;
  }

  const asOf = args.asOf ?? utcDate(io.clock.now());
  const report = io.reportFor(asOf);
  if (args.out === undefined) {
    io.stdout(report);
  } else {
    io.writeFile(args.out, report);
  }
  return 0;
}

/** Records the status and returns so a pipe can flush. `process.exit` drops it. */
export function finishWeeklyReport(code: number): void {
  process.exitCode = code;
}

function parseArgs(argv: string[]): WeeklyReportArgs | undefined {
  let asOf: string | undefined;
  let out: string | undefined;

  for (let index = 0; index < argv.length; index += 1) {
    const flag = argv[index];
    const value = argv[index + 1];
    if (flag === "--as-of" && value !== undefined && isCalendarDate(value)) {
      asOf = value;
      index += 1;
    } else if (flag === "--out" && value !== undefined && !value.startsWith("--")) {
      out = value;
      index += 1;
    } else {
      return undefined;
    }
  }

  return { asOf, out };
}

/** `YYYY-MM-DD` that is a real calendar day, checked in UTC so time zones cannot shift it. */
function isCalendarDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    return false;
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
  );
}

function isDirectRun(): boolean {
  const entry = process.argv[1];
  return entry !== undefined && import.meta.url === pathToFileURL(entry).href;
}

function main(): number {
  const database = openDatabase(config.databaseFile);
  if (isDatabaseEmpty(database)) {
    seedDatabase(database);
  }
  const user = findUserById(database, config.demoUserId);
  if (!user) {
    process.stderr.write(
      `Demo user "${config.demoUserId}" does not exist. Run "npm run db:seed".\n`,
    );
    return 1;
  }

  return runWeeklyReport(process.argv.slice(2), {
    stdout: (text) => process.stdout.write(text),
    stderr: (text) => process.stderr.write(text),
    writeFile: (file, text) => writeFileSync(file, text),
    clock: systemClock,
    reportFor: (asOf) =>
      buildWeeklyReport(loadWeeklyData({ database, user, clock: systemClock }, asOf)),
  });
}

if (isDirectRun()) {
  finishWeeklyReport(main());
}
