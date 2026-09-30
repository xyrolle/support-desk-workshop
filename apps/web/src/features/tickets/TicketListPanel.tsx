import type { SortDirection, TicketListQuery, TicketPage, TicketSort } from "@support-desk/shared";
import type { UseQueryResult } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { Pagination } from "../../components/Pagination.tsx";
import { Panel } from "../../components/Panel.tsx";
import { Button } from "../../components/ui/Button.tsx";
import { EmptyState } from "../../components/ui/EmptyState.tsx";
import { ErrorState } from "../../components/ui/ErrorState.tsx";
import { Kbd } from "../../components/ui/Kbd.tsx";
import { useSearchPalette } from "../search/use-command-palette.ts";
import { SortSelect } from "./SortSelect.tsx";
import { TicketTable } from "./TicketTable.tsx";
import { TicketTableSkeleton } from "./TicketTableSkeleton.tsx";
import type { TicketColumn } from "./ticket-columns.tsx";

type TicketListPanelProps = {
  ticketsQuery: UseQueryResult<TicketPage>;
  query: TicketListQuery;
  onQueryChange: (changes: Partial<TicketListQuery>) => void;
  columns: TicketColumn[];
  /** Filter controls for a project's list. Kept visible when nothing matches. */
  filters?: ReactNode;
  /** What to say when the list has no tickets at all. */
  empty: { title: string; description: string; action?: ReactNode };
};

/** A ticket list in a panel: its count and order on top, the page of tickets, the pages below. */
export function TicketListPanel({
  ticketsQuery,
  query,
  onQueryChange,
  columns,
  filters,
  empty,
}: TicketListPanelProps) {
  const ticketPage = ticketsQuery.data;

  function goToPage(page: number) {
    onQueryChange({ page });
    window.scrollTo({ top: 0 });
  }

  function changeSort(sort: TicketSort, direction: SortDirection) {
    onQueryChange({ sort, direction, page: 1 });
  }

  const isEmpty = ticketPage?.totalItems === 0;
  const showToolbar = !isEmpty || filters != null;

  return (
    <Panel
      toolbar={
        showToolbar && (
          <>
            {filters}
            <p className="px-1 text-ink-muted tabular-nums">
              {ticketPage &&
                `${ticketPage.totalItems} ${ticketPage.totalItems === 1 ? "ticket" : "tickets"}`}
            </p>
            <div className="ml-auto flex items-center gap-2">
              <SearchTicketsButton />
              <SortSelect sort={query.sort} direction={query.direction} onChange={changeSort} />
            </div>
          </>
        )
      }
      footer={
        ticketPage &&
        ticketPage.items.length > 0 && (
          <Pagination
            page={ticketPage.page}
            pageSize={ticketPage.pageSize}
            totalItems={ticketPage.totalItems}
            totalPages={ticketPage.totalPages}
            onPageChange={goToPage}
          />
        )
      }
    >
      <TicketListContent
        ticketsQuery={ticketsQuery}
        columns={columns}
        empty={empty}
        onPageChange={goToPage}
      />
    </Panel>
  );
}

type TicketListContentProps = Pick<TicketListPanelProps, "ticketsQuery" | "columns" | "empty"> & {
  onPageChange: (page: number) => void;
};

function SearchTicketsButton() {
  const { openSearch } = useSearchPalette();
  return (
    <Button variant="secondary" size="sm" onClick={openSearch}>
      Search
      <Kbd>⌘K</Kbd>
    </Button>
  );
}

function TicketListContent({ ticketsQuery, columns, empty, onPageChange }: TicketListContentProps) {
  if (ticketsQuery.isPending) {
    return <TicketTableSkeleton columns={columns} />;
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
    return <EmptyState title={empty.title} description={empty.description} action={empty.action} />;
  }

  if (page.items.length === 0) {
    return (
      <EmptyState
        title={`There is no page ${page.page}`}
        description={`There are ${page.totalItems} tickets on ${page.totalPages} pages.`}
        action={<Button onClick={() => onPageChange(1)}>Go to the first page</Button>}
      />
    );
  }

  return <TicketTable tickets={page.items} columns={columns} />;
}
