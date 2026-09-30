import {
  type ProjectTicketListQuery,
  type SortDirection,
  type TicketChanges,
  type TicketDetail,
  type TicketListQuery,
  type TicketPage,
  type TicketSort,
  unresolvedStatuses,
} from "@support-desk/shared";
import {
  authorize,
  type ProjectAction,
  permissionsFor,
  visibleProjectIds,
} from "../../auth/policy.ts";
import { type AppDatabase, inTransaction } from "../../db/client.ts";
import type { TicketRow } from "../../db/schema.ts";
import { NotFoundError, ValidationError } from "../../http/errors.ts";
import { buildPage, pageRange } from "../../http/pagination.ts";
import type { RequestContext } from "../../request-context.ts";
import { recordTicketEvents } from "../activity/activity.repository.ts";
import {
  findForeignLabelIds,
  findTicketLabelIds,
  replaceTicketLabels,
} from "../labels/labels.repository.ts";
import { findProjectMember } from "../members/members.repository.ts";
import { resolvedAtAfter } from "./resolution.ts";
import { describeChanges } from "./ticket-changes.ts";
import { toFtsQuery } from "./ticket-search.ts";
import {
  countTickets,
  findAssignedTicketRows,
  findTicket,
  findTicketRow,
  findTickets,
  type TicketFilter,
  type TicketOrder,
  type TicketUpdate,
  updateTicketRow,
} from "./tickets.repository.ts";

export function listProjectTickets(
  context: RequestContext,
  projectId: string,
  query: ProjectTicketListQuery,
): TicketPage {
  authorize(context, projectId);
  if (query.label) {
    requireFilterLabels(context.database, projectId, query.label);
  }
  return pageOfTickets(context.database, projectFilter(context, projectId, query), query);
}

/** The project's tickets, narrowed by the list filters. `me` is the current user. */
function projectFilter(
  context: RequestContext,
  projectId: string,
  query: ProjectTicketListQuery,
): TicketFilter {
  const assignees = query.assignee?.map((assignee) =>
    assignee === "me" ? context.user.id : assignee,
  );
  const assigneeIds = assignees?.filter((assignee) => assignee !== "unassigned");
  return {
    projectIds: [projectId],
    statuses: query.status,
    priorities: query.priority,
    assigneeIds: assigneeIds && assigneeIds.length > 0 ? assigneeIds : undefined,
    includeUnassigned: query.assignee?.includes("unassigned"),
    labelIds: query.label,
    search: searchOf(query.q),
  };
}

/** `undefined` is no search. A query with no searchable word matches nothing. */
function searchOf(q: string | undefined): string | null | undefined {
  if (!q) {
    return undefined;
  }
  return toFtsQuery(q) ?? null;
}

/** "My tickets": assigned to the current user and not resolved yet, in any of their projects. */
export function listMyTickets(context: RequestContext, query: TicketListQuery): TicketPage {
  const filter: TicketFilter = {
    projectIds: visibleProjectIds(context),
    assigneeId: context.user.id,
    statuses: unresolvedStatuses,
  };
  return pageOfTickets(context.database, filter, query);
}

type PageQuery = {
  page: number;
  sort?: TicketSort;
  direction: SortDirection;
};

/** One page of the tickets that match the filter, sorted as the query asks. */
export function pageOfTickets(
  database: AppDatabase,
  filter: TicketFilter,
  query: PageQuery,
): TicketPage {
  const items = findTickets(
    database,
    filter,
    ticketOrder(query, filter.search),
    pageRange(query.page),
  );
  const totalItems = countTickets(database, filter);
  return buildPage({ items, page: query.page, totalItems });
}

/** A search with no explicit sort is ranked by relevance. Otherwise the usual order. */
function ticketOrder(query: PageQuery, search: string | null | undefined): TicketOrder {
  if (typeof search === "string" && query.sort === undefined) {
    return { sort: "relevance", direction: "asc" };
  }
  return { sort: query.sort ?? "updated", direction: query.direction };
}

export function getTicket(
  context: RequestContext,
  projectId: string,
  ticketId: string,
): TicketDetail {
  authorize(context, projectId);
  const ticket = findTicket(context.database, projectId, ticketId);
  if (!ticket) {
    throw ticketNotFound(ticketId);
  }
  return ticket;
}

/**
 * The ticket, after the policy allowed the current user to see its project
 * (and to do `action` in it). A ticket from another project is not found.
 */
export function requireTicket(
  context: RequestContext,
  projectId: string,
  ticketId: string,
  action?: ProjectAction,
): TicketRow {
  authorize(context, projectId, action);
  const ticket = findTicketRow(context.database, projectId, ticketId);
  if (!ticket) {
    throw ticketNotFound(ticketId);
  }
  return ticket;
}

/**
 * Applies inline edits from the ticket's side panel. Every property that
 * really changes gets an activity event, saved in the same transaction.
 */
export function updateTicket(
  context: RequestContext,
  projectId: string,
  ticketId: string,
  changes: TicketChanges,
): TicketDetail {
  const { database, user, clock } = context;
  const ticket = requireTicket(context, projectId, ticketId, "editTickets");
  const labelIds = changes.labelIds && [...new Set(changes.labelIds)];
  if (changes.assigneeId) {
    requireAssignable(database, projectId, changes.assigneeId);
  }
  if (labelIds) {
    requireProjectLabels(database, projectId, labelIds);
  }

  const current = { ...ticket, labelIds: findTicketLabelIds(database, ticket.id) };
  const ticketChanges = describeChanges(current, { ...changes, labelIds });
  if (ticketChanges.length > 0) {
    const changedAt = clock.now().toISOString();
    inTransaction(database, () => {
      updateTicketRow(database, ticket.id, changedTicket(ticket, changes, changedAt));
      if (labelIds) {
        replaceTicketLabels(database, ticket.id, labelIds);
      }
      recordTicketEvents(
        database,
        ticketChanges.map((change) => ({
          ...change,
          ticketId: ticket.id,
          actorId: user.id,
          createdAt: changedAt,
        })),
      );
    });
  }

  return getTicket(context, projectId, ticketId);
}

/**
 * Unassigns someone's unresolved tickets in a project, with an activity event
 * for each, when they leave the project or become a viewer.
 */
export function releaseAssignedTickets(
  context: RequestContext,
  projectId: string,
  assigneeId: string,
): void {
  const { database, user, clock } = context;
  const changedAt = clock.now().toISOString();
  const assignedTickets = findAssignedTicketRows(
    database,
    projectId,
    assigneeId,
    unresolvedStatuses,
  );

  inTransaction(database, () => {
    for (const ticket of assignedTickets) {
      updateTicketRow(database, ticket.id, { assigneeId: null, updatedAt: changedAt });
      recordTicketEvents(database, [
        {
          type: "assignee_changed",
          from: assigneeId,
          to: null,
          ticketId: ticket.id,
          actorId: user.id,
          createdAt: changedAt,
        },
      ]);
    }
  });
}

function changedTicket(ticket: TicketRow, changes: TicketChanges, changedAt: string): TicketUpdate {
  const status = changes.status ?? ticket.status;
  return {
    status,
    priority: changes.priority ?? ticket.priority,
    assigneeId: changes.assigneeId === undefined ? ticket.assigneeId : changes.assigneeId,
    resolvedAt: resolvedAtAfter(ticket, status, changedAt),
    updatedAt: changedAt,
  };
}

/** Only people who can work on the project's tickets (agents and admins) can be assigned. */
function requireAssignable(database: AppDatabase, projectId: string, userId: string): void {
  const member = findProjectMember(database, projectId, userId);
  if (!member || !permissionsFor(member.role).editTickets) {
    throw new ValidationError(`assigneeId: "${userId}" is not an agent or admin of this project.`);
  }
}

function requireProjectLabels(database: AppDatabase, projectId: string, labelIds: number[]) {
  const [foreignLabelId] = findForeignLabelIds(database, projectId, labelIds);
  if (foreignLabelId !== undefined) {
    throw new ValidationError(`labelIds: ${foreignLabelId} is not a label of this project.`);
  }
}

function requireFilterLabels(database: AppDatabase, projectId: string, labelIds: number[]) {
  const [foreignLabelId] = findForeignLabelIds(database, projectId, labelIds);
  if (foreignLabelId !== undefined) {
    throw new ValidationError(`label: ${foreignLabelId} is not a label of this project.`);
  }
}

function ticketNotFound(ticketId: string): NotFoundError {
  return new NotFoundError(`Ticket "${ticketId}" was not found.`);
}
