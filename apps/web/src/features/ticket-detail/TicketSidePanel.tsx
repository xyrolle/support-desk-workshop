import type { Project, TicketDetail } from "@support-desk/shared";
import { Building2, Eye } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router";
import { RelativeTime } from "../../components/RelativeTime.tsx";
import { ContactAvatar } from "../customers/ContactAvatar.tsx";
import { TierBadge } from "../customers/TierBadge.tsx";
import { formatSlaTarget, SlaChip } from "../tickets/SlaChip.tsx";
import { useNow } from "../tickets/use-now.ts";
import { AssigneeField } from "./AssigneeField.tsx";
import { editTicketsBlockedReason } from "./edit-permission.ts";
import { LabelsField } from "./LabelsField.tsx";
import { PriorityField } from "./PriorityField.tsx";
import { PropertyRow } from "./PropertyRow.tsx";
import { StatusField } from "./StatusField.tsx";
import { useTicketEditor } from "./use-ticket-editor.ts";

type TicketSidePanelProps = {
  project: Project;
  ticket: TicketDetail;
};

/** The ticket's properties, edited in place, then who asked and when things happened. */
export function TicketSidePanel({ project, ticket }: TicketSidePanelProps) {
  const { update } = useTicketEditor(project.id, ticket.id);
  const blockedReason = editTicketsBlockedReason(project);
  const now = useNow();

  return (
    <aside aria-label="Ticket details" className="sticky top-18 w-76 shrink-0 space-y-5">
      {blockedReason && (
        <p className="flex gap-2 rounded-lg border border-line bg-surface-subtle px-3 py-2.5 text-ink-muted">
          <Eye aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
          {blockedReason}
        </p>
      )}

      <PanelSection title="Properties">
        <PropertyRow label="Status">
          <StatusField
            status={ticket.status}
            blockedReason={blockedReason}
            onChange={(status) => update({ status })}
          />
        </PropertyRow>
        <PropertyRow label="Priority">
          <PriorityField
            priority={ticket.priority}
            blockedReason={blockedReason}
            onChange={(priority) => update({ priority })}
          />
        </PropertyRow>
        <PropertyRow label="Assignee">
          <AssigneeField
            projectId={project.id}
            assignee={ticket.assignee}
            blockedReason={blockedReason}
            onChange={(assigneeId) => update({ assigneeId })}
          />
        </PropertyRow>
        <PropertyRow label="Labels">
          <LabelsField
            projectId={project.id}
            labels={ticket.labels}
            blockedReason={blockedReason}
            onChange={(labelIds) => update({ labelIds })}
          />
        </PropertyRow>
      </PanelSection>

      <PanelSection title="SLA">
        <ClockRow
          label="First response"
          clock={ticket.sla.firstResponse}
          measuredAt={ticket.sla.measuredAt}
          timeZone={project.timeZone}
          now={now}
        />
        <ClockRow
          label="Resolution"
          clock={ticket.sla.resolution}
          measuredAt={ticket.sla.measuredAt}
          timeZone={project.timeZone}
          now={now}
        />
      </PanelSection>

      <PanelSection title="Requester">
        <div className="space-y-2 px-2">
          <p className="flex items-center gap-2">
            <ContactAvatar contact={ticket.requester} />
            <span className="font-medium">{ticket.requester.name}</span>
          </p>
          <p className="truncate pl-7 text-ink-muted">{ticket.requester.email}</p>
          <p className="flex items-center gap-2">
            <Building2 aria-hidden="true" className="size-4 shrink-0 text-ink-subtle" />
            <Link
              to={`/organizations/${ticket.requester.organization.id}`}
              className="truncate font-medium hover:underline focus-visible:outline-2 focus-visible:outline-accent"
            >
              {ticket.requester.organization.name}
            </Link>
            <TierBadge tier={ticket.requester.organization.tier} />
          </p>
        </div>
      </PanelSection>

      <PanelSection title="Dates">
        <PropertyRow label="Opened">
          <DateValue value={ticket.createdAt} />
        </PropertyRow>
        <PropertyRow label="First reply">
          {ticket.firstRespondedAt ? (
            <DateValue value={ticket.firstRespondedAt} />
          ) : (
            <span className="px-2 text-ink-subtle">Not yet</span>
          )}
        </PropertyRow>
        {ticket.resolvedAt && (
          <PropertyRow label="Resolved">
            <DateValue value={ticket.resolvedAt} />
          </PropertyRow>
        )}
        <PropertyRow label="Updated">
          <DateValue value={ticket.updatedAt} />
        </PropertyRow>
      </PanelSection>
    </aside>
  );
}

function ClockRow({
  label,
  clock,
  measuredAt,
  timeZone,
  now,
}: {
  label: string;
  clock: TicketDetail["sla"]["firstResponse"];
  measuredAt: string;
  timeZone: string;
  now: Date;
}) {
  return (
    <PropertyRow label={label}>
      <span className="flex items-center gap-2 px-2">
        <SlaChip clock={clock} measuredAt={measuredAt} timeZone={timeZone} now={now} />
        <span className="text-ink-subtle tabular-nums">{formatSlaTarget(clock.targetMinutes)}</span>
      </span>
    </PropertyRow>
  );
}

function PanelSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="mb-1 px-2 text-xs font-medium text-ink-subtle">{title}</h2>
      <dl className="space-y-px">{children}</dl>
    </section>
  );
}

function DateValue({ value }: { value: string }) {
  return (
    <span className="px-2 text-ink-muted">
      <RelativeTime value={value} />
    </span>
  );
}
