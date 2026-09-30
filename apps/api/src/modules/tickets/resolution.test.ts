import { describe, expect, it } from "vitest";
import { resolvedAtAfter } from "./resolution.ts";

const earlier = "2026-09-28T10:00:00.000Z";
const now = "2026-09-29T13:00:00.000Z";

describe("resolvedAtAfter", () => {
  it("sets the time when an unresolved ticket is resolved or closed", () => {
    const ticket = { status: "in_progress", resolvedAt: null } as const;

    expect(resolvedAtAfter(ticket, "resolved", now)).toBe(now);
    expect(resolvedAtAfter(ticket, "closed", now)).toBe(now);
  });

  it("keeps the original time when a resolved ticket is closed", () => {
    const ticket = { status: "resolved", resolvedAt: earlier } as const;

    expect(resolvedAtAfter(ticket, "closed", now)).toBe(earlier);
  });

  it("clears the time when a ticket is reopened", () => {
    const ticket = { status: "closed", resolvedAt: earlier } as const;

    expect(resolvedAtAfter(ticket, "open", now)).toBeNull();
  });

  it("stays empty while the ticket moves between unresolved statuses", () => {
    const ticket = { status: "open", resolvedAt: null } as const;

    expect(resolvedAtAfter(ticket, "blocked", now)).toBeNull();
  });
});
