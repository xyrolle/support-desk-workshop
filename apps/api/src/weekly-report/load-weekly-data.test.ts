import { describe, expect, it } from "vitest";
import { createTestContext, VIEWER_USER_ID } from "../test/test-app.ts";
import { buildWeeklyReport } from "./build-weekly-report.ts";
import { loadWeeklyData } from "./load-weekly-data.ts";

describe("weekly report projects", () => {
  it("covers the projects Maya can see, by name, and never mentions Billing", () => {
    const data = loadWeeklyData(createTestContext(), "2026-09-29");
    const report = buildWeeklyReport(data);

    expect(data.projects.map((project) => project.name)).toEqual([
      "Checkout",
      "Internal Tools",
      "Mobile App",
    ]);
    expect(report).toContain("Wednesday 23 to Tuesday 29 September 2026, Europe/Berlin");
    expect(report).toContain("Wednesday 23 to Tuesday 29 September 2026, Europe/Lisbon");
    expect(report).toContain("Wednesday 23 to Tuesday 29 September 2026, America/New_York");
    expect(report).not.toContain("Billing");
  });

  it("follows membership, so Ravi sees Billing and not Internal Tools", () => {
    const data = loadWeeklyData(createTestContext(VIEWER_USER_ID), "2026-09-29");
    const report = buildWeeklyReport(data);

    expect(data.projects.map((project) => project.name)).toEqual([
      "Billing",
      "Checkout",
      "Mobile App",
    ]);
    expect(report).toContain("Billing");
    expect(report).not.toContain("Internal Tools");
  });

  it("matches the seeded week ending 29 September 2026", () => {
    const report = buildWeeklyReport(loadWeeklyData(createTestContext(), "2026-09-29"));

    const checkout = section(report, "Checkout");
    expect(checkout).toContain("- Opened 26 · Resolved 10");
    expect(checkout).toContain("- Median first response: 5h 3m (12 tickets)");
    expect(checkout).toContain("- Top labels: Bug (10), Payments (4), Question (4)");
    expect(checkout).toContain("- CHK-144 · 23 days ·");
    expect(checkout).toContain("- CHK-148 · 18 days ·");
    expect(checkout).toContain("- CHK-151 · 14 days ·");
    expect(checkout).toContain("- CHK-153 · 14 days ·");
    expect(checkout).toContain("- CHK-155 · 11 days ·");

    const internalTools = section(report, "Internal Tools");
    expect(internalTools).toContain("- Opened 17 · Resolved 10");
    expect(internalTools).toContain("- Median first response: 6h 48m (6 tickets)");

    const mobileApp = section(report, "Mobile App");
    expect(mobileApp).toContain("- Opened 22 · Resolved 11");
    expect(mobileApp).toContain("- Median first response: 2h 46m (7 tickets)");
    expect(mobileApp).toContain("- Top labels: Question (6), App review (3), Bug (3)");
  });

  it("prints the Checkout section in full", () => {
    const report = buildWeeklyReport(loadWeeklyData(createTestContext(), "2026-09-29"));

    expect(section(report, "Checkout")).toBe(`## Checkout

Wednesday 23 to Tuesday 29 September 2026, Europe/Berlin

- Opened 26 · Resolved 10
- Median first response: 5h 3m (12 tickets)
- Top labels: Bug (10), Payments (4), Question (4)

Oldest open tickets:

- CHK-144 · 23 days · GBP exchange rate not updated since Friday
- CHK-148 · 18 days · Buy one get one discount goes to the cheaper item?
- CHK-151 · 14 days · Payment section jumps down while the page loads
- CHK-153 · 14 days · Expired code should say expired, not invalid
- CHK-155 · 11 days · No GST charged on Australian orders since we registered
`);
  });
});

function section(report: string, name: string): string {
  const start = report.indexOf(`## ${name}`);
  const next = report.indexOf("\n## ", start + 1);
  return report.slice(start, next === -1 ? undefined : next);
}
