import { Skeleton } from "../../components/ui/Skeleton.tsx";
import { Table, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/Table.tsx";
import { type TicketColumn, ticketColumns } from "./ticket-columns.tsx";

/** Title widths vary from row to row, so the placeholder reads like a real list. */
const placeholderRows = [
  { id: 1, titleWidth: "w-3/5" },
  { id: 2, titleWidth: "w-2/5" },
  { id: 3, titleWidth: "w-1/2" },
  { id: 4, titleWidth: "w-2/3" },
  { id: 5, titleWidth: "w-1/3" },
  { id: 6, titleWidth: "w-1/2" },
  { id: 7, titleWidth: "w-3/5" },
  { id: 8, titleWidth: "w-2/5" },
];

const placeholderWidths: Record<TicketColumn, string> = {
  id: "w-14",
  title: "",
  project: "w-20",
  customer: "w-28",
  status: "w-24",
  priority: "w-16",
  assignee: "w-24",
  updated: "ml-auto w-16",
};

/** The table's real header over placeholder rows, so nothing moves when the tickets arrive. */
export function TicketTableSkeleton({
  columns,
  selectable = false,
}: {
  columns: TicketColumn[];
  /** A checkbox column, matching a list that can select rows. */
  selectable?: boolean;
}) {
  return (
    <div role="status" aria-label="Loading tickets">
      <Table>
        <TableHeader>
          {selectable && <TableHead className="w-10 pr-0" />}
          {columns.map((column) => (
            <TableHead key={column} className={ticketColumns[column].className}>
              {ticketColumns[column].header}
            </TableHead>
          ))}
        </TableHeader>
        <tbody>
          {placeholderRows.map(({ id, titleWidth }) => (
            <TableRow key={id}>
              {selectable && (
                <TableCell className="w-10 pr-0">
                  <Skeleton className="size-3.5" />
                </TableCell>
              )}
              {columns.map((column) => (
                <TableCell key={column} className={ticketColumns[column].className}>
                  <Skeleton
                    className={`h-2.5 ${column === "title" ? titleWidth : placeholderWidths[column]}`}
                  />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
