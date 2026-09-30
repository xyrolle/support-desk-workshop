import {
  priorityNames,
  statusNames,
  type TicketEvent,
  type TicketPriority,
  type TicketStatus,
  type User,
} from "@support-desk/shared";
import type { ReactNode } from "react";
import { AppLogo } from "../../components/AppLogo.tsx";
import { RelativeTime } from "../../components/RelativeTime.tsx";
import { Avatar } from "../../components/ui/Avatar.tsx";
import { PriorityIcon } from "../../components/ui/PriorityIcon.tsx";
import { StatusIcon } from "../../components/ui/StatusIcon.tsx";
import { LabelBadge } from "../tickets/LabelBadge.tsx";

/** One change in the activity: who did what, on a single quiet line. */
export function EventItem({ event }: { event: TicketEvent }) {
  return (
    <li className="relative flex items-center gap-2.5 py-1 pr-4 pl-4 text-ink-muted">
      {event.actor ? <Avatar user={event.actor} /> : <AppLogo />}
      <p className="flex min-w-0 flex-1 flex-wrap items-center gap-x-1.5">
        <span className="font-medium text-ink">{event.actor?.name ?? "Support Desk"}</span>
        {describeEvent(event)}
      </p>
      <span className="shrink-0 text-xs">
        <RelativeTime value={event.createdAt} />
      </span>
    </li>
  );
}

function describeEvent(event: TicketEvent): ReactNode {
  switch (event.type) {
    case "status_changed":
      return (
        <>
          changed the status from <StatusName status={event.from} /> to{" "}
          <StatusName status={event.to} />
        </>
      );
    case "priority_changed":
      return (
        <>
          changed the priority from <PriorityName priority={event.from} /> to{" "}
          <PriorityName priority={event.to} />
        </>
      );
    case "assignee_changed":
      return describeAssigneeChange(event.from, event.to);
    case "label_added":
      return (
        <>
          added <LabelBadge label={event.label} />
        </>
      );
    case "label_removed":
      return (
        <>
          removed <LabelBadge label={event.label} />
        </>
      );
  }
}

function describeAssigneeChange(from: User | null, to: User | null): ReactNode {
  if (to && from) {
    return (
      <>
        reassigned the ticket from <PersonName user={from} /> to <PersonName user={to} />
      </>
    );
  }
  if (to) {
    return (
      <>
        assigned the ticket to <PersonName user={to} />
      </>
    );
  }
  return from ? (
    <>
      unassigned <PersonName user={from} />
    </>
  ) : (
    "left the ticket unassigned"
  );
}

function StatusName({ status }: { status: TicketStatus }) {
  return (
    <span className="inline-flex items-center gap-1 font-medium text-ink">
      <StatusIcon status={status} />
      {statusNames[status]}
    </span>
  );
}

function PriorityName({ priority }: { priority: TicketPriority }) {
  return (
    <span className="inline-flex items-center gap-1 font-medium text-ink">
      <PriorityIcon priority={priority} />
      {priorityNames[priority]}
    </span>
  );
}

function PersonName({ user }: { user: User }) {
  return <span className="font-medium text-ink">{user.name}</span>;
}
