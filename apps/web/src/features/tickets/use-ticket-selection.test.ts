import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { bulkSelectionKey, useTicketSelection } from "./use-ticket-selection.ts";

const ids = ["CHK-205", "CHK-204", "CHK-203", "CHK-202"];

describe("useTicketSelection", () => {
  it("selects the range between the anchor and a later shift-click, then moves that end", () => {
    const { result } = renderHook(() => useTicketSelection(ids, "checkout:1"));

    act(() => result.current.toggle("CHK-205", false));
    act(() => result.current.toggle("CHK-203", true));

    expect(result.current.selectedIds).toEqual(["CHK-205", "CHK-204", "CHK-203"]);
    expect(result.current.someSelected).toBe(true);

    act(() => result.current.toggle("CHK-204", true));
    expect(result.current.selectedIds).toEqual(["CHK-205", "CHK-204"]);

    act(() => result.current.toggle("CHK-202", true));
    expect(result.current.selectedIds).toEqual(ids);
    expect(result.current.allSelected).toBe(true);
  });

  it("uses the current row order for the range", () => {
    const { result, rerender } = renderHook(
      ({ ticketIds, resetKey }) => useTicketSelection(ticketIds, resetKey),
      { initialProps: { ticketIds: ids, resetKey: "checkout:1" } },
    );

    act(() => result.current.toggle("CHK-205", false));
    rerender({ ticketIds: [...ids].toReversed(), resetKey: "checkout:1" });
    act(() => result.current.toggle("CHK-203", true));

    expect(result.current.selectedIds).toEqual(["CHK-203", "CHK-204", "CHK-205"]);
  });

  it("selects and clears the whole page from the header", () => {
    const { result } = renderHook(() => useTicketSelection(ids, "checkout:1"));

    act(() => result.current.togglePage(true));
    expect(result.current.allSelected).toBe(true);
    expect(result.current.selectedCount).toBe(4);

    act(() => result.current.togglePage(false));
    expect(result.current.selectedCount).toBe(0);
  });

  it("clears when the page, the filters or the project change", () => {
    const { result, rerender } = renderHook(({ resetKey }) => useTicketSelection(ids, resetKey), {
      initialProps: { resetKey: bulkSelectionKey("checkout", { page: 1 }) },
    });

    act(() => result.current.toggle("CHK-205", false));
    rerender({ resetKey: bulkSelectionKey("checkout", { page: 2 }) });
    expect(result.current.selectedCount).toBe(0);

    act(() => result.current.toggle("CHK-204", false));
    rerender({
      resetKey: bulkSelectionKey("checkout", { page: 2, status: ["open"] }),
    });
    expect(result.current.selectedCount).toBe(0);

    act(() => result.current.toggle("CHK-203", false));
    rerender({
      resetKey: bulkSelectionKey("mobile-app", { page: 2, status: ["open"] }),
    });
    expect(result.current.selectedCount).toBe(0);
  });

  it("keeps the selection when only the sort changes", () => {
    const query = { page: 1, status: ["open"] as const };
    const { result, rerender } = renderHook(({ resetKey }) => useTicketSelection(ids, resetKey), {
      initialProps: { resetKey: bulkSelectionKey("checkout", query) },
    });

    act(() => result.current.togglePage(true));
    rerender({
      resetKey: bulkSelectionKey("checkout", { ...query, sort: "priority", direction: "asc" }),
    });

    expect(result.current.selectedCount).toBe(4);
  });
});
