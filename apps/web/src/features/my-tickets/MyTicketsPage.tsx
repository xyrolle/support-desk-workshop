import { useMyTickets } from "../../api/queries.ts";
import { Breadcrumbs } from "../../components/Breadcrumbs.tsx";
import { PageHeader } from "../../components/PageHeader.tsx";
import { TopBar } from "../../components/TopBar.tsx";
import { TicketListPanel } from "../tickets/TicketListPanel.tsx";
import type { TicketColumn } from "../tickets/ticket-columns.tsx";
import { useTicketListQuery } from "../tickets/use-ticket-list-query.ts";

const columns: TicketColumn[] = [
  "id",
  "title",
  "project",
  "customer",
  "status",
  "priority",
  "updated",
];

/** The tickets assigned to the current user that still need them, across every project. */
export function MyTicketsPage() {
  const { query, changeQuery } = useTicketListQuery();
  const ticketsQuery = useMyTickets(query);

  return (
    <>
      <header className="shrink-0">
        <title>My tickets · Support Desk</title>
        <TopBar>
          <Breadcrumbs items={[{ label: "My tickets" }]} />
        </TopBar>
        <PageHeader
          title="My tickets"
          description="Assigned to you and not resolved yet, in all your projects."
        />
      </header>

      <div className="px-8 pb-8">
        <TicketListPanel
          ticketsQuery={ticketsQuery}
          query={query}
          onQueryChange={changeQuery}
          columns={columns}
          empty={{
            title: "Nothing assigned to you",
            description: "Tickets assigned to you show up here until they are resolved.",
          }}
        />
      </div>
    </>
  );
}
