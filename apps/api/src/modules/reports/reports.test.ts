import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createTestApp, getJson, TEST_NOW, VIEWER_USER_ID } from "../../test/test-app.ts";
import type { VolumeReport } from "./reports.service.ts";

const weekOfSeptember14 = "/api/projects/checkout/reports/volume?from=2026-09-14&to=2026-09-20";

describe("GET /api/projects/:projectId/reports/volume (legacy)", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(TEST_NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("counts tickets opened and resolved per day", async () => {
    const { app } = createTestApp();

    const response = await getJson(app, weekOfSeptember14);

    expect(response.status).toBe(200);
    const report = response.body as VolumeReport;
    expect(report.from).toBe("2026-09-14");
    expect(report.to).toBe("2026-09-20");
    expect(report.days).toHaveLength(7);
    expect(report.days[4]).toEqual({ day: "2026-09-18", opened: 7, resolved: 1 });
    expect(report.totals).toEqual({ opened: 19, resolved: 2 });
  });

  it("averages response and resolution times in hours", async () => {
    const { app } = createTestApp();

    const report = (await getJson(app, weekOfSeptember14)).body as VolumeReport;

    expect(report.avg_first_response_hours).toBe(10.1);
    expect(report.avg_resolution_hours).toBe(169);
  });

  it("shows the current backlog and the oldest open tickets", async () => {
    const { app } = createTestApp();

    const report = (await getJson(app, weekOfSeptember14)).body as VolumeReport;

    expect(report.backlog).toEqual({ open: 20, in_progress: 15, blocked: 12 });
    expect(report.oldest_open.slice(0, 2)).toEqual([
      { ref: "CHK-144", title: expect.any(String), age_days: 23 },
      { ref: "CHK-148", title: expect.any(String), age_days: 18 },
    ]);
  });

  it("covers the last 28 days when no range is given", async () => {
    const { app } = createTestApp();

    const report = (await getJson(app, "/api/projects/checkout/reports/volume"))
      .body as VolumeReport;

    expect(report.from).toBe("2026-09-02");
    expect(report.to).toBe("2026-09-29");
    expect(report.days).toHaveLength(28);
  });

  it.each([
    ["from=2026-09-31", "from must be a date written as YYYY-MM-DD."],
    ["to=yesterday", "to must be a date written as YYYY-MM-DD."],
    ["from=2026-09-20&to=2026-09-14", "from must be on or before to."],
    ["from=2025-01-01&to=2026-09-01", "The report covers at most 366 days."],
  ])("rejects %s", async (query, message) => {
    const { app } = createTestApp();

    const response = await getJson(app, `/api/projects/checkout/reports/volume?${query}`);

    expect(response).toEqual({
      status: 400,
      body: { error: { code: "validation_error", message } },
    });
  });

  it("is open to viewers and hidden from non-members", async () => {
    const viewer = createTestApp(VIEWER_USER_ID);
    const maya = createTestApp();

    const viewerResponse = await getJson(viewer.app, weekOfSeptember14);
    const hidden = await getJson(maya.app, "/api/projects/billing/reports/volume");

    expect(viewerResponse.status).toBe(200);
    expect(hidden.status).toBe(404);
  });
});
