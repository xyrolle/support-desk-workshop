import { useProjects } from "../../api/queries.ts";
import { SidebarLink } from "../../components/SidebarLink.tsx";
import { SidebarSection } from "../../components/SidebarSection.tsx";
import { Skeleton } from "../../components/ui/Skeleton.tsx";
import { ProjectIcon } from "./ProjectIcon.tsx";

export function ProjectSwitcher() {
  return (
    <SidebarSection title="Projects">
      <ProjectLinks />
    </SidebarSection>
  );
}

function ProjectLinks() {
  const projectsQuery = useProjects();

  if (projectsQuery.isPending) {
    return (
      <div className="space-y-3 px-2 py-1.5">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-3 w-24" />
      </div>
    );
  }

  if (projectsQuery.isError) {
    return <p className="px-2 text-ink-muted">Projects could not be loaded.</p>;
  }

  return (
    <ul className="space-y-px">
      {projectsQuery.data.map((project) => (
        <li key={project.id}>
          <SidebarLink to={`/projects/${project.id}`} icon={<ProjectIcon project={project} />}>
            {project.name}
          </SidebarLink>
        </li>
      ))}
    </ul>
  );
}
