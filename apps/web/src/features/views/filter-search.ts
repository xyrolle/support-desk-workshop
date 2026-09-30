import type { TicketFilters } from "@support-desk/shared";
import { toSearchParams } from "../../lib/search-params.ts";

const filterFields = ["status", "priority", "assignee", "label"] as const;

/** The same filters, whatever order the URL or the saved view listed them in. */
export function filtersMatch(left: TicketFilters, right: TicketFilters): boolean {
  return filterFields.every((field) => sameValues(left[field], right[field]));
}

/** `?status=open&status=blocked`, or an empty string when nothing is selected. */
export function filterSearch(filters: TicketFilters): string {
  const search = toSearchParams({
    status: filters.status,
    priority: filters.priority,
    assignee: filters.assignee,
    label: filters.label,
  }).toString();
  return search ? `?${search}` : "";
}

function sameValues(
  left: readonly (string | number)[] | undefined,
  right: readonly (string | number)[] | undefined,
): boolean {
  const first = [...(left ?? [])].map(String).sort();
  const second = [...(right ?? [])].map(String).sort();
  return first.length === second.length && first.every((value, index) => value === second[index]);
}
