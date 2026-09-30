import type { OrganizationDetail } from "@support-desk/shared";
import { Building2 } from "lucide-react";
import type { ReactNode } from "react";
import { useParams } from "react-router";
import { useOrganization, useOrganizationTickets } from "../../api/queries.ts";
import { Breadcrumbs } from "../../components/Breadcrumbs.tsx";
import { PageHeader } from "../../components/PageHeader.tsx";
import { QueryErrorState } from "../../components/QueryErrorState.tsx";
import { TopBar } from "../../components/TopBar.tsx";
import { Skeleton } from "../../components/ui/Skeleton.tsx";
import { formatMonthYear } from "../../lib/dates.ts";
import { TicketListPanel } from "../tickets/TicketListPanel.tsx";
import type { TicketColumn } from "../tickets/ticket-columns.tsx";
import { useTicketListQuery } from "../tickets/use-ticket-list-query.ts";
import { ContactAvatar } from "./ContactAvatar.tsx";
import { TierBadge } from "./TierBadge.tsx";

const columns: TicketColumn[] = ["id", "title", "project", "status", "updated"];

/** A customer: their plan, their people, and their tickets in the projects you can see. */
export function OrganizationPage() {
  const organizationId = useParams().organizationId ?? "";
  const organizationQuery = useOrganization(organizationId);

  if (organizationQuery.isError) {
    return (
      <QueryErrorState
        error={organizationQuery.error}
        crumbs={[{ label: organizationId }]}
        subject="This customer"
        notFound={{
          icon: Building2,
          title: "Customer not found",
          description: "There is no customer organization at this address.",
        }}
        onRetry={() => organizationQuery.refetch()}
      />
    );
  }

  if (!organizationQuery.data) {
    return <OrganizationSkeleton />;
  }

  return <OrganizationView organization={organizationQuery.data} />;
}

function OrganizationView({ organization }: { organization: OrganizationDetail }) {
  const { query, changeQuery } = useTicketListQuery();
  const ticketsQuery = useOrganizationTickets(organization.id, query);

  return (
    <>
      <header className="shrink-0">
        <title>{`${organization.name} · Support Desk`}</title>
        <TopBar>
          <Breadcrumbs
            items={[
              {
                label: organization.name,
                icon: <Building2 aria-hidden="true" className="size-4 text-ink-subtle" />,
              },
            ]}
          />
        </TopBar>
        <PageHeader
          title={organization.name}
          description={`${organization.domain} · Customer since ${formatMonthYear(organization.customerSince)}`}
          titleBadge={<TierBadge tier={organization.tier} />}
        />
      </header>

      <div className="flex items-start gap-6 px-8 pb-8">
        <div className="min-w-0 flex-1">
          <TicketListPanel
            ticketsQuery={ticketsQuery}
            query={query}
            onQueryChange={changeQuery}
            columns={columns}
            empty={{
              title: `No tickets from ${organization.name}`,
              description: "Tickets from this customer in your projects will show up here.",
            }}
          />
        </div>

        <aside aria-label="About this customer" className="sticky top-18 w-72 shrink-0 space-y-6">
          <AsideSection title="Tickets">
            {organization.ticketCount === 0 ? (
              <p className="text-ink-muted">No tickets yet.</p>
            ) : (
              <p className="text-ink-muted">
                <span className="text-lg font-semibold text-ink tabular-nums">
                  {organization.unresolvedTicketCount}
                </span>{" "}
                unresolved of {organization.ticketCount}
              </p>
            )}
            <p className="mt-1 text-xs text-ink-subtle">In the projects you can see.</p>
          </AsideSection>

          <AsideSection title={`Contacts (${organization.contacts.length})`}>
            <ul className="space-y-2.5">
              {organization.contacts.map((contact) => (
                <li key={contact.id} className="flex items-center gap-2.5">
                  <ContactAvatar contact={contact} size="md" />
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{contact.name}</span>
                    <span className="block truncate text-ink-subtle">{contact.email}</span>
                  </span>
                </li>
              ))}
            </ul>
          </AsideSection>
        </aside>
      </div>
    </>
  );
}

function AsideSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 text-xs font-medium text-ink-subtle">{title}</h2>
      {children}
    </section>
  );
}

function OrganizationSkeleton() {
  return (
    <div role="status" aria-label="Loading the customer">
      <TopBar>
        <Skeleton className="h-3 w-40" />
      </TopBar>
      <div className="space-y-2 px-8 pt-7 pb-5">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-3 w-72" />
      </div>
    </div>
  );
}
