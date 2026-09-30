import { describe, expect, it } from "vitest";
import { slaTargetMinutes } from "./sla-targets.ts";

describe("slaTargetMinutes", () => {
  it("looks up the enterprise targets", () => {
    expect(slaTargetMinutes("urgent", "enterprise")).toEqual({
      firstResponseMinutes: 60,
      resolutionMinutes: 540,
    });
    expect(slaTargetMinutes("high", "enterprise")).toEqual({
      firstResponseMinutes: 120,
      resolutionMinutes: 1_620,
    });
    expect(slaTargetMinutes("medium", "enterprise")).toEqual({
      firstResponseMinutes: 240,
      resolutionMinutes: 2_700,
    });
    expect(slaTargetMinutes("low", "enterprise")).toEqual({
      firstResponseMinutes: 480,
      resolutionMinutes: 5_400,
    });
  });

  it("looks up the pro targets", () => {
    expect(slaTargetMinutes("urgent", "pro")).toEqual({
      firstResponseMinutes: 120,
      resolutionMinutes: 1_080,
    });
    expect(slaTargetMinutes("high", "pro")).toEqual({
      firstResponseMinutes: 240,
      resolutionMinutes: 2_700,
    });
    expect(slaTargetMinutes("medium", "pro")).toEqual({
      firstResponseMinutes: 480,
      resolutionMinutes: 4_320,
    });
    expect(slaTargetMinutes("low", "pro")).toEqual({
      firstResponseMinutes: 960,
      resolutionMinutes: 8_100,
    });
  });

  it("looks up the free targets", () => {
    expect(slaTargetMinutes("urgent", "free")).toEqual({
      firstResponseMinutes: 240,
      resolutionMinutes: 1_620,
    });
    expect(slaTargetMinutes("high", "free")).toEqual({
      firstResponseMinutes: 480,
      resolutionMinutes: 3_780,
    });
    expect(slaTargetMinutes("medium", "free")).toEqual({
      firstResponseMinutes: 960,
      resolutionMinutes: 5_400,
    });
    expect(slaTargetMinutes("low", "free")).toEqual({
      firstResponseMinutes: 1_920,
      resolutionMinutes: 10_800,
    });
  });
});
