import { CircleUserRound } from "lucide-react";
import { useMatch } from "react-router";
import { useMyTickets } from "../../api/queries.ts";
import { SidebarLink } from "../../components/SidebarLink.tsx";
import { defaultTicketListQuery } from "../tickets/use-ticket-list-query.ts";

/** "My tickets" with how many are waiting, from the same request as the page's first view. */
export function MyTicketsLink() {
  const { data: page } = useMyTickets(defaultTicketListQuery);
  const isActive = useMatch("/my-tickets") !== null;

  return (
    <SidebarLink
      to="/my-tickets"
      active={isActive}
      icon={<CircleUserRound aria-hidden="true" className="size-4 shrink-0" strokeWidth={1.75} />}
      trailing={page && page.totalItems > 0 ? page.totalItems : undefined}
    >
      My tickets
    </SidebarLink>
  );
}
