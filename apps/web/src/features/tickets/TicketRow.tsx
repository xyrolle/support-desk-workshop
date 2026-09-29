import type { Ticket } from "@support-desk/shared";
import { RelativeTime } from "../../components/RelativeTime.tsx";
import { AssigneeLabel } from "./AssigneeLabel.tsx";
import { PriorityIcon } from "./PriorityIcon.tsx";
import { StatusBadge } from "./StatusBadge.tsx";
import { priorityLabels } from "./ticket-labels.ts";

export function TicketRow({ ticket }: { ticket: Ticket }) {
  return (
    <tr className="border-b border-line transition-colors hover:bg-surface-hover">
      <td className="py-2 pr-3 pl-8 text-[13px] text-ink-subtle tabular-nums">{ticket.id}</td>
      <td className="truncate px-3 py-2 font-medium" title={ticket.title}>
        {ticket.title}
      </td>
      <td className="px-3 py-2">
        <StatusBadge status={ticket.status} />
      </td>
      <td className="px-3 py-2">
        <span className="flex items-center gap-2 text-ink-muted">
          <PriorityIcon priority={ticket.priority} />
          {priorityLabels[ticket.priority]}
        </span>
      </td>
      <td className="px-3 py-2">
        <AssigneeLabel assignee={ticket.assignee} />
      </td>
      <td className="py-2 pr-8 pl-3 text-right text-ink-muted tabular-nums">
        <RelativeTime value={ticket.updatedAt} />
      </td>
    </tr>
  );
}
