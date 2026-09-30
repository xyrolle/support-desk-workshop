import {
  type Organization,
  type OrganizationDetail,
  type TicketListQuery,
  type TicketPage,
  unresolvedStatuses,
} from "@support-desk/shared";
import { visibleProjectIds } from "../../auth/policy.ts";
import type { AppDatabase } from "../../db/client.ts";
import { NotFoundError } from "../../http/errors.ts";
import type { RequestContext } from "../../request-context.ts";
import { countTickets } from "../tickets/tickets.repository.ts";
import { pageOfTickets } from "../tickets/tickets.service.ts";
import { findOrganization, findOrganizationContacts } from "./customers.repository.ts";

// Customer organizations belong to the whole workspace, so every teammate can
// open one. Their tickets are still limited to the projects the user can see.

export function getOrganization(
  context: RequestContext,
  organizationId: string,
): OrganizationDetail {
  const { database } = context;
  const organization = requireOrganization(database, organizationId);
  const projectIds = visibleProjectIds(context);

  return {
    ...organization,
    contacts: findOrganizationContacts(database, organizationId),
    ticketCount: countTickets(database, { projectIds, organizationId }),
    unresolvedTicketCount: countTickets(database, {
      projectIds,
      organizationId,
      statuses: unresolvedStatuses,
    }),
  };
}

export function listOrganizationTickets(
  context: RequestContext,
  organizationId: string,
  query: TicketListQuery,
): TicketPage {
  requireOrganization(context.database, organizationId);
  const filter = { projectIds: visibleProjectIds(context), organizationId };
  return pageOfTickets(context.database, filter, query, context.clock.now());
}

function requireOrganization(database: AppDatabase, organizationId: string): Organization {
  const organization = findOrganization(database, organizationId);
  if (!organization) {
    throw new NotFoundError(`Organization "${organizationId}" was not found.`);
  }
  return organization;
}
