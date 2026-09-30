import { type TicketListQuery, ticketListQuerySchema } from "@support-desk/shared";
import { useSearchParams } from "react-router";
import { toSearchParams } from "../../lib/search-params.ts";

/** The list as it first opens: page 1, most recently updated first. */
export const defaultTicketListQuery = ticketListQuerySchema.parse({});

/**
 * The ticket list query lives in the URL (?page=2), so every view is shareable.
 * Invalid values fall back to the defaults from the shared schema.
 */
export function useTicketListQuery() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = parseTicketListQuery(searchParams);

  function changeQuery(changes: Partial<TicketListQuery>) {
    setSearchParams(searchParamsFor({ ...query, ...changes }));
  }

  return { query, changeQuery };
}

function parseTicketListQuery(searchParams: URLSearchParams): TicketListQuery {
  const result = ticketListQuerySchema.safeParse(Object.fromEntries(searchParams));
  return result.success ? result.data : defaultTicketListQuery;
}

/** Leaves defaults out, so the URL reads ?page=2 rather than ?page=2&sort=updated&direction=desc. */
function searchParamsFor(query: TicketListQuery): URLSearchParams {
  return toSearchParams({
    page: query.page === defaultTicketListQuery.page ? undefined : query.page,
    sort: query.sort === defaultTicketListQuery.sort ? undefined : query.sort,
    direction: query.direction === defaultTicketListQuery.direction ? undefined : query.direction,
  });
}
