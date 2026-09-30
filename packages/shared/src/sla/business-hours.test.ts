import { describe, expect, it } from "vitest";
import { businessMinutesBetween, instantFromZonedTime } from "./business-hours.ts";

const berlin = "Europe/Berlin";

/** A wall-clock time in a time zone, as an absolute instant. */
function at(
  timeZone: string,
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
): Date {
  return instantFromZonedTime({ year, month, day, hour, minute }, timeZone);
}

describe("instantFromZonedTime", () => {
  it("turns a Berlin wall time into the right instant, including after summer time ends", () => {
    expect(at(berlin, 2026, 9, 25, 16, 0).toISOString()).toBe("2026-09-25T14:00:00.000Z");
    expect(at(berlin, 2026, 10, 26, 10, 0).toISOString()).toBe("2026-10-26T09:00:00.000Z");
  });

  it("turns a New York wall time into the right instant, including after daylight saving ends", () => {
    expect(at("America/New_York", 2026, 10, 30, 17, 30).toISOString()).toBe(
      "2026-10-30T21:30:00.000Z",
    );
    expect(at("America/New_York", 2026, 11, 2, 9, 30).toISOString()).toBe(
      "2026-11-02T14:30:00.000Z",
    );
  });
});

describe("businessMinutesBetween", () => {
  it("skips the weekend between Friday afternoon and Monday morning", () => {
    const minutes = businessMinutesBetween(
      at(berlin, 2026, 9, 25, 16, 0),
      at(berlin, 2026, 9, 28, 11, 0),
      berlin,
    );

    expect(minutes).toBe(240);
  });

  it("starts at Monday opening when the range begins on Saturday", () => {
    const minutes = businessMinutesBetween(
      at(berlin, 2026, 9, 26, 12, 0),
      at(berlin, 2026, 9, 28, 10, 30),
      berlin,
    );

    expect(minutes).toBe(90);
  });

  it("counts local business hours across the end of summer time in Berlin", () => {
    const minutes = businessMinutesBetween(
      at(berlin, 2026, 10, 23, 17, 0),
      at(berlin, 2026, 10, 26, 10, 0),
      berlin,
    );

    expect(minutes).toBe(120);
  });

  it("counts local business hours across the end of daylight saving time in New York", () => {
    const minutes = businessMinutesBetween(
      at("America/New_York", 2026, 10, 30, 17, 30),
      at("America/New_York", 2026, 11, 2, 9, 30),
      "America/New_York",
    );

    expect(minutes).toBe(60);
  });
});
