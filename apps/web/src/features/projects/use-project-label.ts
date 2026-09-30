import { useProjects } from "../../api/queries.ts";

/** The project's name when the user's projects include it, otherwise the id from the URL. */
export function useProjectLabel(projectId: string): string {
  const { data: projects } = useProjects();
  return projects?.find((project) => project.id === projectId)?.name ?? projectId;
}
