import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useRowSelection } from "./use-row-selection.ts";

const rowIds = ["CHK-101", "CHK-102", "CHK-103"];

describe("useRowSelection", () => {
  it("selects rows one by one and knows when some or all are selected", () => {
    const { result } = renderHook(() => useRowSelection(rowIds));

    act(() => result.current.toggleRow("CHK-102", true));
    expect(result.current.isSelected("CHK-102")).toBe(true);
    expect(result.current.someSelected).toBe(true);

    act(() => result.current.toggleAll(true));
    expect(result.current.selectedCount).toBe(3);
    expect(result.current.allSelected).toBe(true);
    expect(result.current.someSelected).toBe(false);
  });

  it("clears the selection", () => {
    const { result } = renderHook(() => useRowSelection(rowIds));

    act(() => result.current.toggleAll(true));
    act(() => result.current.clear());

    expect(result.current.selectedCount).toBe(0);
  });

  it("only counts rows that are still in the list", () => {
    const { result, rerender } = renderHook((ids: string[]) => useRowSelection(ids), {
      initialProps: rowIds,
    });

    act(() => result.current.toggleRow("CHK-101", true));
    rerender(["CHK-102", "CHK-103"]);

    expect(result.current.selectedCount).toBe(0);
    expect(result.current.allSelected).toBe(false);
  });
});
