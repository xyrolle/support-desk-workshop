import { describe, expect, it } from "vitest";
import { addDays, ageInDays, daysBetween, eachDay, formatDay, parseDay } from "./legacy-dates.ts";

describe("parseDay", () => {
  it("parses a day to midnight UTC", () => {
    expect(parseDay("2026-09-01")?.toISOString()).toBe("2026-09-01T00:00:00.000Z");
  });

  it.each([undefined, "", "2026-9-1", "01/09/2026", "2026-02-30", "2026-13-01", "yesterday"])(
    "rejects %s",
    (value) => {
      expect(parseDay(value)).toBeNull();
    },
  );
});

describe("day arithmetic", () => {
  const first = new Date("2026-09-28T00:00:00.000Z");

  it("formats, adds and counts whole UTC days", () => {
    expect(formatDay(addDays(first, 3))).toBe("2026-10-01");
    expect(daysBetween(first, addDays(first, 3))).toBe(3);
  });

  it("lists every day of a range, both ends included", () => {
    expect(eachDay(first, addDays(first, 2))).toEqual(["2026-09-28", "2026-09-29", "2026-09-30"]);
  });

  it("counts a ticket's age in whole days", () => {
    expect(ageInDays("2026-09-25T18:00:00.000Z", first)).toBe(2);
  });
});
