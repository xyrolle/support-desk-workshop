import { FolderOpen } from "lucide-react";
import { Navigate } from "react-router";
import { useProjects } from "../../api/queries.ts";
import { Button } from "../../components/Button.tsx";
import { EmptyState } from "../../components/EmptyState.tsx";
import { ErrorState } from "../../components/ErrorState.tsx";

/** The home page: sends the user to their first project. */
export function FirstProjectRedirect() {
  const projectsQuery = useProjects();

  if (projectsQuery.isPending) {
    return null;
  }

  if (projectsQuery.isError) {
    return (
      <ErrorState
        title="Projects could not be loaded"
        description={projectsQuery.error.message}
        action={<Button onClick={() => projectsQuery.refetch()}>Try again</Button>}
      />
    );
  }

  const firstProject = projectsQuery.data[0];
  if (!firstProject) {
    return (
      <EmptyState
        icon={FolderOpen}
        title="No projects yet"
        description="You are not a member of any project. Ask a teammate to add you."
      />
    );
  }

  return <Navigate to={`/projects/${firstProject.id}`} replace />;
}
