import { ticketRef } from "@support-desk/shared";

/**
 * @deprecated Use `ticketRef(projectKey, number)` from `@support-desk/shared`.
 * Kept only for the legacy reports module, which passes raw SQL rows.
 */
export function formatTicketRef(row: { project_key: string; number: number }): string {
  return ticketRef(row.project_key, row.number);
}
