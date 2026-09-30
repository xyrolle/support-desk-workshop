import { useProjectLabel } from "./use-project-label.ts";

/** A project's name from the cached project list, for rows that only carry the id. */
export function ProjectName({ projectId }: { projectId: string }) {
  return <>{useProjectLabel(projectId)}</>;
}
