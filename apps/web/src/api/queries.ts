import type { TicketListQuery } from "@support-desk/shared";
import { useQuery } from "@tanstack/react-query";
import { api } from "./client.ts";

export const queryKeys = {
  currentUser: ["current-user"] as const,
  projects: ["projects"] as const,
  project: (projectId: string) => ["projects", projectId] as const,
  tickets: (projectId: string, query: TicketListQuery) =>
    ["projects", projectId, "tickets", query] as const,
};

export function useCurrentUser() {
  return useQuery({
    queryKey: queryKeys.currentUser,
    queryFn: api.getCurrentUser,
  });
}

export function useProjects() {
  return useQuery({
    queryKey: queryKeys.projects,
    queryFn: api.listProjects,
  });
}

export function useProject(projectId: string) {
  return useQuery({
    queryKey: queryKeys.project(projectId),
    queryFn: () => api.getProject(projectId),
  });
}

export function useTickets(projectId: string, query: TicketListQuery) {
  return useQuery({
    queryKey: queryKeys.tickets(projectId, query),
    queryFn: () => api.listTickets(projectId, query),
  });
}
