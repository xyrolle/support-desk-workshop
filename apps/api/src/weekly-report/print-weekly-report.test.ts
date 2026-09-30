import { spawnSync } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import type { Clock } from "../lib/dates.ts";
import { runWeeklyReport, type WeeklyReportIo } from "./print-weekly-report.ts";

const clockAt = (iso: string): Clock => ({ now: () => new Date(iso) });

function capture(
  clock: Clock,
  reportFor: WeeklyReportIo["reportFor"] = (asOf) => `report ${asOf}`,
) {
  const stdout: string[] = [];
  const stderr: string[] = [];
  const files = new Map<string, string>();
  const io: WeeklyReportIo = {
    stdout: (text) => stdout.push(text),
    stderr: (text) => stderr.push(text),
    writeFile: (file, text) => files.set(file, text),
    clock,
    reportFor,
  };
  return { io, stdout, stderr, files };
}

describe("runWeeklyReport", () => {
  it("exits 1 with a usage message when --as-of is not a real date", () => {
    const { io, stdout, stderr, files } = capture(clockAt("2026-09-29T13:00:00.000Z"));

    expect(runWeeklyReport(["--as-of", "2026-02-31"], io)).toBe(1);
    expect(runWeeklyReport(["--as-of", "yesterday"], io)).toBe(1);

    const usage = stderr.join("\n");
    expect(usage).toContain("--as-of");
    expect(usage).toContain("--out");
    expect(stdout).toEqual([]);
    expect(files.size).toBe(0);
  });

  it("writes the report to --out and does not print it", () => {
    const { io, stdout, files } = capture(clockAt("2026-09-29T13:00:00.000Z"));
    const file = path.join(mkdtempSync(path.join(tmpdir(), "weekly-report-")), "report.md");

    expect(runWeeklyReport(["--as-of", "2026-09-29", "--out", file], io)).toBe(0);
    expect(files.get(file)).toBe("report 2026-09-29");
    expect(stdout).toEqual([]);
  });

  it("prints the report when --out is omitted", () => {
    const { io, stdout, files } = capture(clockAt("2026-09-29T13:00:00.000Z"));

    expect(runWeeklyReport(["--as-of", "2026-09-29"], io)).toBe(0);
    expect(stdout).toEqual(["report 2026-09-29"]);
    expect(files.size).toBe(0);
  });

  it("uses today's UTC date when --as-of is omitted", () => {
    const { io, stdout } = capture(clockAt("2026-09-30T00:30:00.000Z"));

    expect(runWeeklyReport([], io)).toBe(0);
    expect(stdout).toEqual(["report 2026-09-30"]);
  });

  it("sets the exit code and lets a pipe flush the whole report", () => {
    const moduleUrl = new URL("./print-weekly-report.ts", import.meta.url).href;
    const child = spawnSync(
      process.execPath,
      [
        "--input-type=module",
        "-e",
        `
          import { finishWeeklyReport } from ${JSON.stringify(moduleUrl)};
          process.stdout.write("A".repeat(80000) + "END\\n");
          finishWeeklyReport(0);
        `,
      ],
      { encoding: "utf8", maxBuffer: 1_000_000 },
    );

    const failure = child.stderr ?? "";
    expect(child.status, failure).toBe(0);
    expect(child.stdout?.endsWith("END\n"), failure).toBe(true);
  });
});
