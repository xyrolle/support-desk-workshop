import { FolderX } from "lucide-react";
import { useProject, useTickets } from "../../api/queries.ts";
import { QueryErrorState } from "../../components/QueryErrorState.tsx";
import { Button } from "../../components/ui/Button.tsx";
import { MembersButton } from "../projects/MembersButton.tsx";
import { ProjectHeader, ProjectHeaderSkeleton } from "../projects/ProjectHeader.tsx";
import { ReadOnlyBadge } from "../projects/ReadOnlyBadge.tsx";
import { useProjectId } from "../projects/use-project-id.ts";
import { useProjectLabel } from "../projects/use-project-label.ts";
import { SaveViewDialog } from "../views/SaveViewDialog.tsx";
import { FilterBar } from "./FilterBar.tsx";
import { TicketListPanel } from "./TicketListPanel.tsx";
import type { TicketColumn } from "./ticket-columns.tsx";
import {
  clearedFilters,
  filtersAreActive,
  ticketFiltersOf,
  useTicketListQuery,
} from "./use-ticket-list-query.ts";

const columns: TicketColumn[] = [
  "id",
  "title",
  "customer",
  "status",
  "priority",
  "assignee",
  "updated",
];

export function TicketListPage() {
  const projectId = useProjectId();
  const { query, changeQuery } = useTicketListQuery();
  const projectQuery = useProject(projectId);
  const ticketsQuery = useTickets(projectId, query);
  const projectLabel = useProjectLabel(projectId);
  const filtered = filtersAreActive(query);

  if (projectQuery.isError) {
    return (
      <QueryErrorState
        error={projectQuery.error}
        crumbs={[{ label: projectLabel }]}
        subject="This project"
        notFound={{
          icon: FolderX,
          title: "Project not found",
          description: "This project does not exist, or you do not have access to it.",
        }}
        onRetry={() => projectQuery.refetch()}
      />
    );
  }

  return (
    <>
      {projectQuery.isSuccess ? (
        <ProjectHeader
          project={projectQuery.data}
          page="Tickets"
          title={projectQuery.data.name}
          description={projectQuery.data.description}
          titleBadge={<ReadOnlyBadge project={projectQuery.data} />}
          actions={<MembersButton project={projectQuery.data} />}
        />
      ) : (
        <ProjectHeaderSkeleton />
      )}

      <div className="px-8 pb-8">
        <TicketListPanel
          ticketsQuery={ticketsQuery}
          query={query}
          onQueryChange={changeQuery}
          columns={columns}
          filters={
            <>
              <FilterBar
                projectId={projectId}
                filters={query}
                onChange={changeQuery}
                onClear={() => changeQuery(clearedFilters)}
              />
              {filtered && (
                <SaveViewDialog projectId={projectId} filters={ticketFiltersOf(query)} />
              )}
            </>
          }
          empty={
            filtered
              ? {
                  title: "No tickets match these filters",
                  description: "Every ticket in this project is hidden by the current filters.",
                  action: (
                    <Button onClick={() => changeQuery(clearedFilters)}>Clear filters</Button>
                  ),
                }
              : {
                  title: "No tickets yet",
                  description: "New tickets for this project will show up here.",
                }
          }
        />
      </div>
    </>
  );
}
