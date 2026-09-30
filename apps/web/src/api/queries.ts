import type { ProjectTicketListQuery, TicketListQuery } from "@support-desk/shared";
import { useQuery } from "@tanstack/react-query";
import { api } from "./client.ts";

/**
 * Every key starts with what it belongs to, so a change can refresh everything
 * under it: `["projects", projectId]` covers the project's tickets and members.
 */
export const queryKeys = {
  currentUser: ["current-user"] as const,
  users: ["users"] as const,
  myTickets: ["my-tickets"] as const,
  myTicketsPage: (query: TicketListQuery) => ["my-tickets", query] as const,
  projects: ["projects"] as const,
  project: (projectId: string) => ["projects", projectId] as const,
  labels: (projectId: string) => ["projects", projectId, "labels"] as const,
  members: (projectId: string) => ["projects", projectId, "members"] as const,
  views: (projectId: string) => ["projects", projectId, "views"] as const,
  tickets: (projectId: string, query: ProjectTicketListQuery) =>
    ["projects", projectId, "tickets", "list", query] as const,
  ticket: (projectId: string, ticketId: string) =>
    ["projects", projectId, "tickets", ticketId] as const,
  comments: (projectId: string, ticketId: string) =>
    ["projects", projectId, "tickets", ticketId, "comments"] as const,
  activity: (projectId: string, ticketId: string) =>
    ["projects", projectId, "tickets", ticketId, "activity"] as const,
  organizations: ["organizations"] as const,
  organization: (organizationId: string) => ["organizations", organizationId] as const,
  organizationTickets: (organizationId: string, query: TicketListQuery) =>
    ["organizations", organizationId, "tickets", query] as const,
};

export function useCurrentUser() {
  return useQuery({ queryKey: queryKeys.currentUser, queryFn: api.getCurrentUser });
}

export function useUsers() {
  return useQuery({ queryKey: queryKeys.users, queryFn: api.listUsers });
}

export function useMyTickets(query: TicketListQuery) {
  return useQuery({
    queryKey: queryKeys.myTicketsPage(query),
    queryFn: () => api.listMyTickets(query),
  });
}

export function useProjects() {
  return useQuery({ queryKey: queryKeys.projects, queryFn: api.listProjects });
}

export function useProject(projectId: string) {
  return useQuery({
    queryKey: queryKeys.project(projectId),
    queryFn: () => api.getProject(projectId),
  });
}

export function useLabels(projectId: string) {
  return useQuery({
    queryKey: queryKeys.labels(projectId),
    queryFn: () => api.listLabels(projectId),
  });
}

export function useMembers(projectId: string) {
  return useQuery({
    queryKey: queryKeys.members(projectId),
    queryFn: () => api.listMembers(projectId),
  });
}

export function useViews(projectId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.views(projectId),
    queryFn: () => api.listViews(projectId),
    enabled,
  });
}

export function useTickets(projectId: string, query: ProjectTicketListQuery) {
  return useQuery({
    queryKey: queryKeys.tickets(projectId, query),
    queryFn: () => api.listTickets(projectId, query),
  });
}

export function useTicket(projectId: string, ticketId: string) {
  return useQuery({
    queryKey: queryKeys.ticket(projectId, ticketId),
    queryFn: () => api.getTicket(projectId, ticketId),
  });
}

export function useComments(projectId: string, ticketId: string) {
  return useQuery({
    queryKey: queryKeys.comments(projectId, ticketId),
    queryFn: () => api.listComments(projectId, ticketId),
  });
}

export function useActivity(projectId: string, ticketId: string) {
  return useQuery({
    queryKey: queryKeys.activity(projectId, ticketId),
    queryFn: () => api.listActivity(projectId, ticketId),
  });
}

export function useOrganization(organizationId: string) {
  return useQuery({
    queryKey: queryKeys.organization(organizationId),
    queryFn: () => api.getOrganization(organizationId),
  });
}

export function useOrganizationTickets(organizationId: string, query: TicketListQuery) {
  return useQuery({
    queryKey: queryKeys.organizationTickets(organizationId, query),
    queryFn: () => api.listOrganizationTickets(organizationId, query),
  });
}
