import type { Project } from "@support-desk/shared";
import { Bookmark } from "lucide-react";
import { useViews } from "../../api/queries.ts";
import { SidebarLink } from "../../components/SidebarLink.tsx";
import { Button } from "../../components/ui/Button.tsx";
import { useTicketListQuery } from "../tickets/use-ticket-list-query.ts";
import { filterSearch, filtersMatch } from "./filter-search.ts";

type ProjectViewsProps = {
  project: Project;
};

/** The current user's saved filters, nested under the project they belong to. */
export function ProjectViews({ project }: ProjectViewsProps) {
  const viewsQuery = useViews(project.id);
  const { query } = useTicketListQuery();

  if (viewsQuery.isError) {
    return (
      <p className="flex flex-wrap items-center gap-x-1 py-1 pr-2 pl-8 text-ink-muted">
        Views could not be loaded.
        <Button variant="ghost" size="sm" onClick={() => viewsQuery.refetch()}>
          Try again
        </Button>
      </p>
    );
  }

  if (!viewsQuery.isSuccess || viewsQuery.data.length === 0) {
    return null;
  }

  return (
    <ul className="space-y-px">
      {viewsQuery.data.map((view) => (
        <li key={view.id}>
          <SidebarLink
            to={`/projects/${project.id}${filterSearch(view.filters)}`}
            active={filtersMatch(query, view.filters)}
            nested
            icon={<Bookmark aria-hidden="true" className="size-3.5 shrink-0" strokeWidth={1.75} />}
          >
            {view.name}
          </SidebarLink>
        </li>
      ))}
    </ul>
  );
}
