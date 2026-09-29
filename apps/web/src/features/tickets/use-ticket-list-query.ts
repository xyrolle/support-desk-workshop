import { type TicketListQuery, ticketListQuerySchema } from "@support-desk/shared";
import { useSearchParams } from "react-router";
import { toSearchParams } from "../../lib/search-params.ts";

/**
 * The ticket list query lives in the URL (?page=2), so every view is shareable.
 * Invalid values fall back to the defaults from the shared schema.
 */
export function useTicketListQuery() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = parseTicketListQuery(searchParams);

  function changeQuery(changes: Partial<TicketListQuery>) {
    setSearchParams(toSearchParams({ ...query, ...changes }));
  }

  return { query, changeQuery };
}

function parseTicketListQuery(searchParams: URLSearchParams): TicketListQuery {
  const result = ticketListQuerySchema.safeParse(Object.fromEntries(searchParams));
  return result.success ? result.data : ticketListQuerySchema.parse({});
}
