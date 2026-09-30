import { listedSlaClock, type TicketListItem } from "@support-desk/shared";
import type { ReactNode } from "react";
import { Link } from "react-router";
import { RelativeTime } from "../../components/RelativeTime.tsx";
import { ProjectName } from "../projects/ProjectName.tsx";
import { AssigneeLabel } from "./AssigneeLabel.tsx";
import { PriorityLabel } from "./PriorityLabel.tsx";
import { SlaChip } from "./SlaChip.tsx";
import { StatusLabel } from "./StatusLabel.tsx";
import { useSlaClock } from "./use-now.ts";

export type TicketColumn =
  | "id"
  | "title"
  | "project"
  | "customer"
  | "status"
  | "sla"
  | "priority"
  | "assignee"
  | "updated";

type ColumnDefinition = {
  header: string;
  /** Width and alignment of the column, shared by its header and cells. */
  className?: string;
  cellClassName?: string;
  render: (ticket: TicketListItem) => ReactNode;
};

export function ticketPath(ticket: Pick<TicketListItem, "id" | "projectId">): string {
  return `/projects/${ticket.projectId}/tickets/${ticket.id}`;
}

/** What each column shows. Pages pick the columns they need. */
export const ticketColumns: Record<TicketColumn, ColumnDefinition> = {
  id: {
    header: "ID",
    className: "w-20",
    cellClassName: "whitespace-nowrap text-ink-subtle tabular-nums",
    render: (ticket) => ticket.id,
  },
  title: {
    header: "Title",
    // About 200px, the room left in a 1504px window once the other columns take theirs.
    className: "w-[12.5rem]",
    render: (ticket) => <TicketTitle ticket={ticket} />,
  },
  project: {
    header: "Project",
    className: "w-32",
    cellClassName: "truncate text-ink-muted",
    render: (ticket) => <ProjectName projectId={ticket.projectId} />,
  },
  customer: {
    header: "Customer",
    className: "w-[10.25rem]",
    cellClassName: "truncate text-ink-muted",
    render: (ticket) => ticket.requester.organization.name,
  },
  status: {
    header: "Status",
    className: "w-44",
    render: (ticket) => <StatusLabel status={ticket.status} />,
  },
  sla: {
    header: "SLA",
    className: "w-[10.75rem]",
    cellClassName: "whitespace-nowrap",
    render: (ticket) => <TicketSla ticket={ticket} />,
  },
  priority: {
    header: "Priority",
    className: "w-28",
    cellClassName: "text-ink-muted",
    render: (ticket) => <PriorityLabel priority={ticket.priority} />,
  },
  assignee: {
    header: "Assignee",
    className: "w-[8.5rem]",
    render: (ticket) => <AssigneeLabel assignee={ticket.assignee} />,
  },
  updated: {
    header: "Updated",
    className: "w-[7.375rem] text-right",
    // Above the row's link, so the exact time still shows on hover.
    cellClassName: "relative whitespace-nowrap text-ink-muted tabular-nums",
    render: (ticket) => <RelativeTime value={ticket.updatedAt} />,
  },
};

/** The title links to the ticket and covers the whole row, so any click opens it. */
function TicketTitle({ ticket }: { ticket: TicketListItem }) {
  return (
    <Link
      to={ticketPath(ticket)}
      className="block truncate font-medium outline-none before:absolute before:inset-0"
      title={ticket.title}
    >
      {ticket.title}
    </Link>
  );
}

/** The clock that matters for this row. Resolved tickets leave the cell empty. */
function TicketSla({ ticket }: { ticket: TicketListItem }) {
  const slaClock = useSlaClock();
  const clock = listedSlaClock(ticket);
  const timeZone = slaClock?.timeZoneFor(ticket.projectId);
  if (!clock || !slaClock || !timeZone) {
    return null;
  }
  return (
    <SlaChip
      clock={clock}
      measuredAt={ticket.sla.measuredAt}
      timeZone={timeZone}
      now={slaClock.now}
    />
  );
}
