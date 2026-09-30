import type {
  NewComment,
  NewProjectMember,
  NewSavedView,
  ProjectMemberChanges,
  TicketChanges,
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
