import type { Ticket } from "@support-desk/shared";
import { RelativeTime } from "../../components/RelativeTime.tsx";
import { TableCell, TableRow } from "../../components/ui/Table.tsx";
import { AssigneeLabel } from "./AssigneeLabel.tsx";
import { PriorityLabel } from "./PriorityLabel.tsx";
import { StatusLabel } from "./StatusLabel.tsx";

export function TicketRow({ ticket }: { ticket: Ticket }) {
  return (
    <TableRow>
      <TableCell className="text-ink-subtle">{ticket.id}</TableCell>
      <TableCell className="truncate font-medium" title={ticket.title}>
        {ticket.title}
      </TableCell>
      <TableCell>
        <StatusLabel status={ticket.status} />
      </TableCell>
      <TableCell className="text-ink-muted">
        <PriorityLabel priority={ticket.priority} />
      </TableCell>
      <TableCell>
        <AssigneeLabel assignee={ticket.assignee} />
      </TableCell>
      <TableCell className="text-right text-ink-muted tabular-nums">
        <RelativeTime value={ticket.updatedAt} />
      </TableCell>
    </TableRow>
  );
}
