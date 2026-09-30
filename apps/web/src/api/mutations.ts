import type {
  BulkTicketUpdate,
  Label,
  NewComment,
  NewProjectMember,
  NewSavedView,
  ProjectMember,
  ProjectMemberChanges,
  ProjectTicketListQuery,
  TicketChanges,
  TicketListItem,
  TicketPage,
  User,
} from "@support-desk/shared";
import { type QueryClient, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "./client.ts";
import { queryKeys } from "./queries.ts";

/** A ticket change shows up in the project's lists, My tickets and organization pages. */
function refreshTicketLists(queryClient: QueryClient, projectId: string) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: ["projects", projectId, "tickets"] }),
    queryClient.invalidateQueries({ queryKey: queryKeys.myTickets }),
    queryClient.invalidateQueries({ queryKey: queryKeys.organizations }),
  ]);
}

/**
 * One request for every selected ticket. The visible list updates immediately
 * and goes back if the request fails. Other cached pages are left alone.
 */
export function useBulkUpdateTickets(projectId: string, query: ProjectTicketListQuery) {
  const queryClient = useQueryClient();
  const queryKey = queryKeys.tickets(projectId, query);

  return useMutation({
    mutationFn: (body: BulkTicketUpdate) => api.bulkUpdateTickets(projectId, body),
    onMutate: async (body) => {
      await queryClient.cancelQueries({ queryKey });
      const previousPage = queryClient.getQueryData<TicketPage>(queryKey);
      if (previousPage) {
        queryClient.setQueryData(
          queryKey,
          applyBulkToPage(previousPage, body, readLookup(queryClient, projectId)),
        );
      }
      return { previousPage };
    },
    onError: (_error, _body, context) => {
      if (context?.previousPage) {
        queryClient.setQueryData(queryKey, context.previousPage);
      }
    },
    onSuccess: (result) => {
      queryClient.setQueryData<TicketPage>(queryKey, (page) => mergeTickets(page, result.tickets));
    },
  });
}

type ChangeLookup = {
  members: ProjectMember[];
  labels: Label[];
};

function readLookup(queryClient: QueryClient, projectId: string): ChangeLookup {
  return {
    members: queryClient.getQueryData<ProjectMember[]>(queryKeys.members(projectId)) ?? [],
    labels: queryClient.getQueryData<Label[]>(queryKeys.labels(projectId)) ?? [],
  };
}

function applyBulkToPage(
  page: TicketPage,
  body: BulkTicketUpdate,
  lookup: ChangeLookup,
): TicketPage {
  const changesByTicket = new Map(body.updates.map((update) => [update.ticketId, update.changes]));
  return {
    ...page,
    items: page.items.map((ticket) => {
      const changes = changesByTicket.get(ticket.id);
      return changes ? withChanges(ticket, changes, lookup) : ticket;
    }),
  };
}

function withChanges(
  ticket: TicketListItem,
  changes: TicketChanges,
  lookup: ChangeLookup,
): TicketListItem {
  return {
    ...ticket,
    status: changes.status ?? ticket.status,
    priority: changes.priority ?? ticket.priority,
    assignee: assigneeAfter(ticket, changes.assigneeId, lookup.members),
    labels:
      changes.labelIds === undefined
        ? ticket.labels
        : labelsAfter(changes.labelIds, ticket, lookup.labels),
  };
}

function assigneeAfter(
  ticket: TicketListItem,
  assigneeId: string | null | undefined,
  members: ProjectMember[],
): User | null {
  if (assigneeId === undefined) {
    return ticket.assignee;
  }
  if (assigneeId === null) {
    return null;
  }
  const member = members.find((candidate) => candidate.id === assigneeId);
  return member ? toUser(member) : ticket.assignee;
}

function toUser(member: ProjectMember): User {
  return {
    id: member.id,
    name: member.name,
    initials: member.initials,
    email: member.email,
    avatarColor: member.avatarColor,
  };
}

function labelsAfter(labelIds: number[], ticket: TicketListItem, projectLabels: Label[]): Label[] {
  return labelIds.flatMap((labelId) => {
    const label =
      projectLabels.find((candidate) => candidate.id === labelId) ??
      ticket.labels.find((candidate) => candidate.id === labelId);
    return label ? [label] : [];
  });
}

function mergeTickets(
  page: TicketPage | undefined,
  tickets: TicketListItem[],
): TicketPage | undefined {
  if (!page) {
    return page;
  }
  const byId = new Map(tickets.map((ticket) => [ticket.id, ticket]));
  return { ...page, items: page.items.map((ticket) => byId.get(ticket.id) ?? ticket) };
}

export function useUpdateTicket(projectId: string, ticketId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (changes: TicketChanges) => api.updateTicket(projectId, ticketId, changes),
    onSuccess: (ticket) => {
      queryClient.setQueryData(queryKeys.ticket(projectId, ticketId), ticket);
      return refreshTicketLists(queryClient, projectId);
    },
  });
}

export function useAddComment(projectId: string, ticketId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (comment: NewComment) => api.addComment(projectId, ticketId, comment),
    onSuccess: () => refreshTicketLists(queryClient, projectId),
  });
}

/**
 * A membership change can unassign tickets and change what the current user may do,
 * so everything about projects refreshes.
 */
function refreshMembership(queryClient: QueryClient) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.projects }),
    queryClient.invalidateQueries({ queryKey: queryKeys.myTickets }),
    queryClient.invalidateQueries({ queryKey: queryKeys.organizations }),
  ]);
}

export function useAddMember(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (member: NewProjectMember) => api.addMember(projectId, member),
    onSuccess: () => refreshMembership(queryClient),
  });
}

export function useChangeMemberRole(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, changes }: { userId: string; changes: ProjectMemberChanges }) =>
      api.changeMemberRole(projectId, userId, changes),
    onSuccess: () => refreshMembership(queryClient),
  });
}

export function useRemoveMember(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => api.removeMember(projectId, userId),
    onSuccess: () => refreshMembership(queryClient),
  });
}

export function useCreateView(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (view: NewSavedView) => api.createView(projectId, view),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.views(projectId) }),
  });
}
