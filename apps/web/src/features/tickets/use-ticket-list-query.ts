import {
  type ProjectTicketListQuery,
  type TicketFilters,
  ticketFiltersSchema,
  ticketListQuerySchema,
  ticketPrioritySchema,
  ticketStatusSchema,
} from "@support-desk/shared";
import { useSearchParams } from "react-router";
import { z } from "zod";
import { toSearchParams } from "../../lib/search-params.ts";

/** The list as it first opens: page 1, most recently updated first. */
export const defaultTicketListQuery = ticketListQuerySchema.parse({});

const filterFields = ["status", "priority", "assignee", "label"] as const;

/** No status, priority, assignee or label. */
export const clearedFilters: TicketFilters = {
  status: undefined,
  priority: undefined,
  assignee: undefined,
  label: undefined,
};

export function filtersAreActive(filters: TicketFilters): boolean {
  return filterFields.some((field) => (filters[field]?.length ?? 0) > 0);
}

/** The four filter fields, without page or sort. */
export function ticketFiltersOf(query: ProjectTicketListQuery): TicketFilters {
  return {
    status: query.status,
    priority: query.priority,
    assignee: query.assignee,
    label: query.label,
  };
}

/**
 * The ticket list query lives in the URL (?page=2&status=open&status=blocked), so every
 * view is shareable. Unknown filter values are dropped. Invalid page or sort falls back
 * to the defaults from the shared schema.
 */
export function useTicketListQuery() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = parseTicketListQuery(searchParams);

  function changeQuery(changes: Partial<ProjectTicketListQuery>) {
    const filtersChanged = filterFields.some((field) => field in changes) || "sla" in changes;
    setSearchParams(
      searchParamsFor({
        ...query,
        ...changes,
        page: filtersChanged ? 1 : (changes.page ?? query.page),
      }),
    );
  }

  return { query, changeQuery };
}

function parseTicketListQuery(searchParams: URLSearchParams) {
  const paging = ticketListQuerySchema.safeParse({
    page: searchParams.get("page") ?? undefined,
    sort: searchParams.get("sort") ?? undefined,
    direction: searchParams.get("direction") ?? undefined,
  });
  const filters = ticketFiltersSchema.parse({
    status: accepted(searchParams.getAll("status"), ticketStatusSchema),
    priority: accepted(searchParams.getAll("priority"), ticketPrioritySchema),
    assignee: accepted(searchParams.getAll("assignee"), z.string().min(1)),
    label: accepted(searchParams.getAll("label"), z.coerce.number().int().positive()),
  });

  return {
    ...(paging.success ? paging.data : defaultTicketListQuery),
    ...filters,
    sla: searchParams.get("sla") === "at_risk" ? ("at_risk" as const) : undefined,
  };
}

/**
 * Keeps values the item schema accepts. A repeated parameter arrives as several strings;
 * one bad value must not throw away the rest.
 */
function accepted<Value>(values: string[], schema: z.ZodType<Value>): Value[] | undefined {
  const kept = values.flatMap((value) => {
    const result = schema.safeParse(value);
    return result.success ? [result.data] : [];
  });
  return kept.length > 0 ? kept : undefined;
}

/** Leaves defaults out, so the URL reads ?page=2 rather than ?page=2&sort=updated&direction=desc. */
function searchParamsFor(query: ProjectTicketListQuery): URLSearchParams {
  return toSearchParams({
    page: query.page === defaultTicketListQuery.page ? undefined : query.page,
    sort: query.sort === defaultTicketListQuery.sort ? undefined : query.sort,
    direction: query.direction === defaultTicketListQuery.direction ? undefined : query.direction,
    status: query.status,
    priority: query.priority,
    assignee: query.assignee,
    label: query.label,
    sla: query.sla,
  });
}
