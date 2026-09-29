import { describe, expect, it } from "vitest";
import { formatRelativeTime } from "./dates.ts";

const now = new Date("2026-03-02T12:00:00.000Z");

describe("formatRelativeTime", () => {
  it.each([
    ["2026-03-02T11:59:30.000Z", "just now"],
    ["2026-03-02T11:55:00.000Z", "5 minutes ago"],
    ["2026-03-02T09:00:00.000Z", "3 hours ago"],
    ["2026-03-01T10:00:00.000Z", "yesterday"],
    ["2026-02-26T12:00:00.000Z", "4 days ago"],
    ["2026-02-16T12:00:00.000Z", "2 weeks ago"],
    ["2025-12-01T12:00:00.000Z", "3 months ago"],
  ])("formats %s as %s", (isoDate, expected) => {
    expect(formatRelativeTime(isoDate, now)).toBe(expected);
  });
});
