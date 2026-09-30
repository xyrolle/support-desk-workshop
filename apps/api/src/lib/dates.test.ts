import { describe, expect, it } from "vitest";
import { addMinutes, utcDate, zonedParts } from "./dates.ts";

describe("zonedParts", () => {
  it("gives the wall-clock time in the time zone", () => {
    const instant = new Date("2026-09-29T13:00:00.000Z");

    expect(zonedParts(instant, "Europe/Berlin")).toEqual({
      year: 2026,
      month: 9,
      day: 29,
      hour: 15,
      minute: 0,
      weekday: 2,
    });
    expect(zonedParts(instant, "America/New_York")).toMatchObject({ hour: 9, weekday: 2 });
  });

  it("moves to the previous day when the time zone is still behind midnight", () => {
    const instant = new Date("2026-09-28T02:30:00.000Z");

    expect(zonedParts(instant, "America/New_York")).toMatchObject({
      day: 27,
      hour: 22,
      minute: 30,
      weekday: 7,
    });
  });

  it("follows daylight saving time", () => {
    const beforeTheChange = new Date("2026-10-24T10:00:00.000Z");
    const afterTheChange = new Date("2026-10-26T10:00:00.000Z");

    expect(zonedParts(beforeTheChange, "Europe/Berlin").hour).toBe(12);
    expect(zonedParts(afterTheChange, "Europe/Berlin").hour).toBe(11);
  });
});

describe("addMinutes and utcDate", () => {
  it("do plain instant arithmetic in UTC", () => {
    const start = new Date("2026-09-29T23:30:00.000Z");

    expect(addMinutes(start, 45).toISOString()).toBe("2026-09-30T00:15:00.000Z");
    expect(utcDate(start)).toBe("2026-09-29");
  });
});
