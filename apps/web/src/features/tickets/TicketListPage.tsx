import type { TicketPage } from "@support-desk/shared";
import type { UseQueryResult } from "@tanstack/react-query";
import { FolderX } from "lucide-react";
import { useRef } from "react";
import { Link } from "react-router";
import { isNotFoundError } from "../../api/client.ts";
import { useProject, useTickets } from "../../api/queries.ts";
import { Button, buttonClassName } from "../../components/Button.tsx";
import { EmptyState } from "../../components/EmptyState.tsx";
import { ErrorState } from "../../components/ErrorState.tsx";
import { Pagination } from "../../components/Pagination.tsx";
import { ProjectHeader, ProjectHeaderSkeleton } from "../projects/ProjectHeader.tsx";
import { useProjectId } from "../projects/use-project-id.ts";
import { TicketTable } from "./TicketTable.tsx";
import { TicketTableSkeleton } from "./TicketTableSkeleton.tsx";
import { useTicketListQuery } from "./use-ticket-list-query.ts";

export function TicketListPage() {
  const projectId = useProjectId();
  const { query, changeQuery } = useTicketListQuery();
  const projectQuery = useProject(projectId);
  const ticketsQuery = useTickets(projectId, query);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  function goToPage(page: number) {
    changeQuery({ page });
    scrollAreaRef.current?.scrollTo({ top: 0 });
  }

  if (projectQuery.isError) {
    return <ProjectError error={projectQuery.error} onRetry={() => projectQuery.refetch()} />;
  }

  const ticketPage = ticketsQuery.data;
  const hasTickets = ticketPage !== undefined && ticketPage.items.length > 0;

  return (
    <>
      {projectQuery.isSuccess ? (
        <ProjectHeader project={projectQuery.data} />
      ) : (
        <ProjectHeaderSkeleton />
      )}

      <div ref={scrollAreaRef} className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        <TicketListContent ticketsQuery={ticketsQuery} onPageChange={goToPage} />
      </div>

      {hasTickets && (
        <Pagination
          page={ticketPage.page}
          pageSize={ticketPage.pageSize}
          totalItems={ticketPage.totalItems}
          totalPages={ticketPage.totalPages}
          onPageChange={goToPage}
        />
      )}
    </>
  );
}

type TicketListContentProps = {
  ticketsQuery: UseQueryResult<TicketPage>;
  onPageChange: (page: number) => void;
};

function TicketListContent({ ticketsQuery, onPageChange }: TicketListContentProps) {
  if (ticketsQuery.isPending) {
    return <TicketTableSkeleton />;
  }

  if (ticketsQuery.isError) {
    return (
      <ErrorState
        title="Tickets could not be loaded"
        description={ticketsQuery.error.message}
        action={<Button onClick={() => ticketsQuery.refetch()}>Try again</Button>}
      />
    );
  }

  const page = ticketsQuery.data;
  if (page.totalItems === 0) {
    return (
      <EmptyState
        title="No tickets yet"
        description="New tickets for this project will show up here."
      />
    );
  }

  if (page.items.length === 0) {
    return (
      <EmptyState
        title={`There is no page ${page.page}`}
        description={`This project has ${page.totalItems} tickets on ${page.totalPages} pages.`}
        action={<Button onClick={() => onPageChange(1)}>Go to the first page</Button>}
      />
    );
  }

  return <TicketTable tickets={page.items} />;
}

type ProjectErrorProps = {
  error: Error;
  onRetry: () => void;
};

function ProjectError({ error, onRetry }: ProjectErrorProps) {
  if (isNotFoundError(error)) {
    return (
      <EmptyState
        icon={FolderX}
        title="Project not found"
        description="This project does not exist, or you do not have access to it."
        action={
          <Link to="/" className={buttonClassName}>
            Back to your projects
          </Link>
        }
      />
    );
  }

  return (
    <ErrorState
      title="This project could not be loaded"
      description={error.message}
      action={<Button onClick={onRetry}>Try again</Button>}
    />
  );
}
