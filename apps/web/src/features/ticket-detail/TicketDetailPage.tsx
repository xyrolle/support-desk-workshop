import type { Project, TicketDetail } from "@support-desk/shared";
import { FileQuestion } from "lucide-react";
import { useParams } from "react-router";
import { useProject, useTicket } from "../../api/queries.ts";
import { Breadcrumbs } from "../../components/Breadcrumbs.tsx";
import { QueryErrorState } from "../../components/QueryErrorState.tsx";
import { RelativeTime } from "../../components/RelativeTime.tsx";
import { TopBar } from "../../components/TopBar.tsx";
import { projectCrumb } from "../projects/ProjectHeader.tsx";
import { useProjectId } from "../projects/use-project-id.ts";
import { useProjectLabel } from "../projects/use-project-label.ts";
import { TicketConversation } from "./TicketConversation.tsx";
import { TicketDetailSkeleton } from "./TicketDetailSkeleton.tsx";
import { TicketSidePanel } from "./TicketSidePanel.tsx";

export function TicketDetailPage() {
  const projectId = useProjectId();
  const ticketId = useParams().ticketId ?? "";
  const projectQuery = useProject(projectId);
  const ticketQuery = useTicket(projectId, ticketId);
  const projectLabel = useProjectLabel(projectId);

  const error = projectQuery.error ?? ticketQuery.error;
  if (error) {
    return (
      <QueryErrorState
        error={error}
        crumbs={[{ label: projectLabel }, { label: ticketId }]}
        subject="This ticket"
        notFound={{
          icon: FileQuestion,
          title: "Ticket not found",
          description: `${ticketId} does not exist, or it belongs to a project you cannot see.`,
        }}
        onRetry={() => {
          projectQuery.refetch();
          ticketQuery.refetch();
        }}
      />
    );
  }

  if (!projectQuery.data || !ticketQuery.data) {
    return <TicketDetailSkeleton />;
  }

  return <TicketDetailView project={projectQuery.data} ticket={ticketQuery.data} />;
}

type TicketDetailViewProps = {
  project: Project;
  ticket: TicketDetail;
};

function TicketDetailView({ project, ticket }: TicketDetailViewProps) {
  return (
    <>
      <title>{`${ticket.id} ${ticket.title} · Support Desk`}</title>
      <TopBar>
        <Breadcrumbs
          items={[
            projectCrumb(project),
            { label: "Tickets", to: `/projects/${project.id}` },
            { label: ticket.id },
          ]}
        />
      </TopBar>

      <div className="flex items-start gap-10 px-8 pt-7 pb-16">
        <article className="min-w-0 max-w-3xl flex-1">
          <h1 className="text-xl font-semibold tracking-tight text-balance">{ticket.title}</h1>
          <p className="mt-1 text-ink-muted">
            {ticket.id} · opened by {ticket.requester.name} ({ticket.requester.organization.name}){" "}
            <RelativeTime value={ticket.createdAt} />
          </p>
          <div className="mt-6">
            <TicketConversation project={project} ticket={ticket} />
          </div>
        </article>
        <TicketSidePanel project={project} ticket={ticket} />
      </div>
    </>
  );
}
