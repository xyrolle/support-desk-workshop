import type { TicketListItem } from "@support-desk/shared";
import type { ReactNode } from "react";
import { Link } from "react-router";
import { RelativeTime } from "../../components/RelativeTime.tsx";
import { ProjectName } from "../projects/ProjectName.tsx";
import { AssigneeLabel } from "./AssigneeLabel.tsx";
import { PriorityLabel } from "./PriorityLabel.tsx";
import { StatusLabel } from "./StatusLabel.tsx";

export type TicketColumn =
  | "id"
  | "title"
  | "project"
  | "customer"
  | "status"
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
    className: "w-24",
    cellClassName: "whitespace-nowrap text-ink-subtle tabular-nums",
    render: (ticket) => ticket.id,
  },
  title: {
    header: "Title",
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
    className: "w-44",
    cellClassName: "truncate text-ink-muted",
    render: (ticket) => ticket.requester.organization.name,
  },
  status: {
    header: "Status",
    className: "w-48",
    render: (ticket) => <StatusLabel status={ticket.status} />,
  },
  priority: {
    header: "Priority",
    className: "w-28",
    cellClassName: "text-ink-muted",
    render: (ticket) => <PriorityLabel priority={ticket.priority} />,
  },
  assignee: {
    header: "Assignee",
    className: "w-40",
    render: (ticket) => <AssigneeLabel assignee={ticket.assignee} />,
  },
  updated: {
    header: "Updated",
    className: "w-32 text-right",
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
