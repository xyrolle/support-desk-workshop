import { useState } from "react";

/**
 * Which rows of a table are selected, by id. Ids that leave `rowIds` (another page,
 * a new filter) stop counting as selected.
 */
export function useRowSelection(rowIds: string[]) {
  const [selectedIds, setSelectedIds] = useState<ReadonlySet<string>>(new Set());
  const selectedCount = rowIds.filter((id) => selectedIds.has(id)).length;

  function toggleRow(id: string, isSelected: boolean) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (isSelected) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  }

  function toggleAll(isSelected: boolean) {
    setSelectedIds(new Set(isSelected ? rowIds : []));
  }

  return {
    selectedCount,
    allSelected: rowIds.length > 0 && selectedCount === rowIds.length,
    someSelected: selectedCount > 0 && selectedCount < rowIds.length,
    isSelected: (id: string) => selectedIds.has(id),
    toggleRow,
    toggleAll,
    clear: () => setSelectedIds(new Set()),
  };
}
