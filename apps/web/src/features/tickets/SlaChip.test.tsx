import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SlaChip } from "./SlaChip.tsx";
import { useNow } from "./use-now.ts";

const measuredAt = "2026-09-29T13:00:00.000Z";
const now = new Date(measuredAt);
const timeZone = "Europe/Berlin";

function LiveChip() {
  const tickingNow = useNow();
  return (
    <SlaChip
      clock={{ state: "running", targetMinutes: 120, elapsedMinutes: 59 }}
      measuredAt={measuredAt}
      timeZone={timeZone}
      now={tickingNow}
    />
  );
}

describe("SlaChip", () => {
  it("names the time left, a breach and a pause", () => {
    const { rerender } = render(
      <SlaChip
        clock={{ state: "running", targetMinutes: 180, elapsedMinutes: 46 }}
        measuredAt={measuredAt}
        timeZone={timeZone}
        now={now}
      />,
    );
    expect(screen.getByText("2h 14m left")).toHaveAttribute("data-tone", "neutral");

    rerender(
      <SlaChip
        clock={{ state: "breached", targetMinutes: 60, elapsedMinutes: 90 }}
        measuredAt={measuredAt}
        timeZone={timeZone}
        now={now}
      />,
    );
    expect(screen.getByText("Breached 30m ago")).toHaveAttribute("data-tone", "breached");

    rerender(
      <SlaChip
        clock={{ state: "paused", targetMinutes: 540, elapsedMinutes: 80 }}
        measuredAt={measuredAt}
        timeZone={timeZone}
        now={now}
      />,
    );
    expect(screen.getByText("Paused")).toHaveAttribute("data-tone", "paused");
  });

  it("ticks a running clock forward in business minutes and turns amber under an hour", () => {
    vi.useFakeTimers();
    vi.setSystemTime(now);

    render(<LiveChip />);

    expect(screen.getByText("1h 01m left")).toHaveAttribute("data-tone", "neutral");

    act(() => {
      vi.advanceTimersByTime(2 * 60 * 1000);
    });

    expect(screen.getByText("59m left")).toHaveAttribute("data-tone", "amber");
    vi.useRealTimers();
  });
});

afterEach(() => {
  vi.useRealTimers();
});
