import { useParams } from "react-router";

/** The :projectId from the URL. Only use inside /projects/:projectId routes. */
export function useProjectId(): string {
  const { projectId } = useParams();
  if (!projectId) {
    throw new Error("useProjectId() was called outside a /projects/:projectId route.");
  }
  return projectId;
}
