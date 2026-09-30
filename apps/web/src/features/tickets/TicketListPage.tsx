import { FolderX } from "lucide-react";
import { useProject, useTickets } from "../../api/queries.ts";
import { QueryErrorState } from "../../components/QueryErrorState.tsx";
import { Button } from "../../components/ui/Button.tsx";
import { MembersButton } from "../projects/MembersButton.tsx";
import { ProjectHeader, ProjectHeaderSkeleton } from "../projects/ProjectHeader.tsx";
import { ReadOnlyBadge } from "../projects/ReadOnlyBadge.tsx";
import { useProjectId } from "../projects/use-project-id.ts";
import { useProjectLabel } from "../projects/use-project-label.ts";
import { editTicketsBlockedReason } from "../ticket-detail/edit-permission.ts";
import { SaveViewDialog } from "../views/SaveViewDialog.tsx";
import { FilterBar } from "./FilterBar.tsx";
import { TicketListPanel } from "./TicketListPanel.tsx";
import type { TicketColumn } from "./ticket-columns.tsx";
import { useBulkTicketActions } from "./use-bulk-ticket-actions.ts";
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
  "sla",
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
  const narrowed = filtered || query.sla === "at_risk";
  const bulkActions = useBulkTicketActions(
    projectId,
    query,
    ticketsQuery.data?.items.map((ticket) => ticket.id) ?? [],
  );

  function clearFilters() {
    changeQuery({ ...clearedFilters, sla: undefined });
  }

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
                sla={query.sla}
                onChange={changeQuery}
                onClear={clearFilters}
              />
              {filtered && (
                <SaveViewDialog projectId={projectId} filters={ticketFiltersOf(query)} />
              )}
            </>
          }
          selection={
            projectQuery.isSuccess
              ? {
                  projectId,
                  blockedReason: editTicketsBlockedReason(projectQuery.data),
                  isSelected: bulkActions.isSelected,
                  allSelected: bulkActions.allSelected,
                  someSelected: bulkActions.someSelected,
                  selectedCount: bulkActions.selectedCount,
                  onToggle: bulkActions.toggle,
                  onTogglePage: bulkActions.togglePage,
                  onClear: bulkActions.clear,
                  onApply: bulkActions.apply,
                }
              : undefined
          }
          empty={
            narrowed
              ? {
                  title: "No tickets match these filters",
                  description: "Every ticket in this project is hidden by the current filters.",
                  action: <Button onClick={clearFilters}>Clear filters</Button>,
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
