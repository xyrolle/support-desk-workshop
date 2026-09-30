import type { TicketListItem } from "@support-desk/shared";
import { Table, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/Table.tsx";
import { classNames } from "../../lib/class-names.ts";
import { type TicketColumn, ticketColumns } from "./ticket-columns.tsx";

type TicketTableProps = {
  tickets: TicketListItem[];
  columns: TicketColumn[];
};

export function TicketTable({ tickets, columns }: TicketTableProps) {
  return (
    <Table>
      <TableHeader>
        {columns.map((column) => (
          <TableHead key={column} className={ticketColumns[column].className}>
            {ticketColumns[column].header}
          </TableHead>
        ))}
      </TableHeader>
      <tbody>
        {tickets.map((ticket) => (
          <TableRow key={ticket.id} className="relative cursor-pointer">
            {columns.map((column) => (
              <TableCell
                key={column}
                className={classNames(
                  ticketColumns[column].className,
                  ticketColumns[column].cellClassName,
                )}
              >
                {ticketColumns[column].render(ticket)}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </tbody>
    </Table>
  );
}
