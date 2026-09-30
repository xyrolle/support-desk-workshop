import { useRef, useState } from "react";

/**
 * The list query. Sort and direction are accepted so a full query can be passed,
 * and left out of the key so reordering does not clear the selection.
 */
type SelectionQuery = {
  page: number;
  status?: readonly string[];
  priority?: readonly string[];
  assignee?: readonly string[];
  label?: readonly number[];
  q?: string;
  sort?: string;
  direction?: string;
};

/**
 * What the selection is tied to. Page, filters and project are in it; sort is
 * not, so reordering the same rows keeps the selection.
 */
export function bulkSelectionKey(projectId: string, query: SelectionQuery): string {
  return JSON.stringify({
    projectId,
    page: query.page,
    status: query.status ?? null,
    priority: query.priority ?? null,
    assignee: query.assignee ?? null,
    label: query.label ?? null,
    q: query.q ?? null,
  });
}

/**
 * Which tickets on the current page are selected.
 * A click toggles one row and becomes the anchor. Shift-click selects every
 * row between that anchor and the clicked row, in the current order, and
 * another shift-click moves the far end of the range.
 */
export function useTicketSelection(ticketIds: readonly string[], resetKey: string) {
  const [selectedIds, setSelectedIds] = useState<ReadonlySet<string>>(() => new Set());
  const [seenKey, setSeenKey] = useState(resetKey);
  const anchorId = useRef<string | null>(null);

  if (seenKey !== resetKey) {
    setSeenKey(resetKey);
    setSelectedIds(new Set());
    anchorId.current = null;
  }

  const visibleIds = ticketIds.filter((ticketId) => selectedIds.has(ticketId));

  function toggle(ticketId: string, shiftKey: boolean) {
    const anchor = anchorId.current;
    if (shiftKey && anchor && ticketIds.includes(anchor) && ticketIds.includes(ticketId)) {
      setSelectedIds(new Set(idsBetween(ticketIds, anchor, ticketId)));
      return;
    }
    anchorId.current = ticketId;
    setSelectedIds((current) => toggleId(current, ticketId));
  }

  function togglePage(selected: boolean) {
    anchorId.current = null;
    setSelectedIds(selected ? new Set(ticketIds) : new Set());
  }

  function clear() {
    anchorId.current = null;
    setSelectedIds(new Set());
  }

  return {
    selectedIds: visibleIds,
    selectedCount: visibleIds.length,
    allSelected: ticketIds.length > 0 && visibleIds.length === ticketIds.length,
    someSelected: visibleIds.length > 0 && visibleIds.length < ticketIds.length,
    isSelected: (ticketId: string) => selectedIds.has(ticketId),
    toggle,
    togglePage,
    clear,
  };
}

function toggleId(selectedIds: ReadonlySet<string>, ticketId: string): Set<string> {
  const next = new Set(selectedIds);
  if (next.has(ticketId)) {
    next.delete(ticketId);
  } else {
    next.add(ticketId);
  }
  return next;
}

/** Inclusive range, following the list as it is ordered right now. */
function idsBetween(ticketIds: readonly string[], anchorId: string, ticketId: string): string[] {
  const start = ticketIds.indexOf(anchorId);
  const end = ticketIds.indexOf(ticketId);
  const [from, to] = start < end ? [start, end] : [end, start];
  return ticketIds.slice(from, to + 1);
}
