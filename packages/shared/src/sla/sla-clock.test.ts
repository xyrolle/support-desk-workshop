import { describe, expect, it } from "vitest";
import { instantFromZonedTime } from "./business-hours.ts";
import { measureTicketSla } from "./sla-clock.ts";

const berlin = "Europe/Berlin";

function at(day: number, hour: number, minute: number): Date {
  return instantFromZonedTime({ year: 2026, month: 9, day, hour, minute }, berlin);
}

describe("measureTicketSla", () => {
  it("leaves out the business minutes spent waiting on the customer", () => {
    const sla = measureTicketSla({
      createdAt: at(28, 9, 0),
      firstRespondedAt: null,
      resolvedAt: null,
      status: "in_progress",
      priority: "low",
      tier: "free",
      timeZone: berlin,
      now: at(29, 15, 0),
      statusChanges: [
        { at: at(28, 11, 0), to: "blocked" },
        { at: at(29, 14, 0), to: "in_progress" },
      ],
    });

    expect(sla.resolution.elapsedMinutes).toBe(180);
    expect(sla.firstResponse.elapsedMinutes).toBe(180);
  });
});
