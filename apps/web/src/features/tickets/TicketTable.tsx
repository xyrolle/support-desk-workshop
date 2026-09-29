import type { Ticket } from "@support-desk/shared";
import { Table, TableHead, TableHeader } from "../../components/ui/Table.tsx";
import { TicketRow } from "./TicketRow.tsx";

export function TicketTable({ tickets }: { tickets: Ticket[] }) {
  return (
    <Table>
      <TableHeader>
        <TableHead className="w-24">ID</TableHead>
        <TableHead>Title</TableHead>
        <TableHead className="w-36">Status</TableHead>
        <TableHead className="w-32">Priority</TableHead>
        <TableHead className="w-48">Assignee</TableHead>
        <TableHead className="w-32 text-right">Updated</TableHead>
      </TableHeader>
      <tbody>
        {tickets.map((ticket) => (
          <TicketRow key={ticket.id} ticket={ticket} />
        ))}
      </tbody>
    </Table>
  );
}
