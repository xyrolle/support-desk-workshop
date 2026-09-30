import type { TicketListItem } from "@support-desk/shared";
import { TicketRow } from "./TicketRow.tsx";

export function TicketTable({ tickets }: { tickets: TicketListItem[] }) {
  return (
    <table className="w-full table-fixed border-collapse">
      <thead className="sticky top-0 z-10 bg-canvas">
        <tr className="border-b border-line text-left text-xs text-ink-subtle">
          <th scope="col" className="w-28 py-2.5 pr-3 pl-8 font-medium">
            ID
          </th>
          <th scope="col" className="px-3 py-2.5 font-medium">
            Title
          </th>
          <th scope="col" className="w-48 px-3 py-2.5 font-medium">
            Status
          </th>
          <th scope="col" className="w-32 px-3 py-2.5 font-medium">
            Priority
          </th>
          <th scope="col" className="w-48 px-3 py-2.5 font-medium">
            Assignee
          </th>
          <th scope="col" className="w-40 py-2.5 pr-8 pl-3 text-right font-medium">
            Updated
          </th>
        </tr>
      </thead>
      <tbody>
        {tickets.map((ticket) => (
          <TicketRow key={ticket.id} ticket={ticket} />
        ))}
      </tbody>
    </table>
  );
}
