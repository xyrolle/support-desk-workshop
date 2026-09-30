import { type Project, roleNames } from "@support-desk/shared";
import { Settings } from "lucide-react";
import { useLocation } from "react-router";
import { useProjects } from "../../api/queries.ts";
import { SidebarLink } from "../../components/SidebarLink.tsx";
import { SidebarSection } from "../../components/SidebarSection.tsx";
import { Skeleton } from "../../components/ui/Skeleton.tsx";
import { ProjectIcon } from "./ProjectIcon.tsx";

export function ProjectSwitcher() {
  return (
    <SidebarSection title="Projects">
      <ProjectList />
    </SidebarSection>
  );
}

/** Each project with the user's role in it. */
function ProjectList() {
  const projectsQuery = useProjects();
  const { pathname } = useLocation();

  if (projectsQuery.isPending) {
    return (
      <div className="space-y-3 px-2 py-1.5">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-32" />
      </div>
    );
  }

  if (projectsQuery.isError) {
    return <p className="px-2 text-ink-muted">Projects could not be loaded.</p>;
  }

  return (
    <ul className="space-y-px">
      {projectsQuery.data.map((project) => (
        <ProjectLinks key={project.id} project={project} pathname={pathname} />
      ))}
    </ul>
  );
}

type ProjectLinksProps = {
  project: Project;
  pathname: string;
};

/** The project, highlighted on its tickets, and its settings for admins. */
function ProjectLinks({ project, pathname }: ProjectLinksProps) {
  const projectPath = `/projects/${project.id}`;
  const settingsPath = `${projectPath}/settings`;
  const inProject = pathname === projectPath || pathname.startsWith(`${projectPath}/`);
  const inSettings = pathname === settingsPath;

  return (
    <li className="space-y-px">
      <SidebarLink
        to={projectPath}
        active={inProject && !inSettings}
        icon={<ProjectIcon project={project} />}
        trailing={roleNames[project.role]}
      >
        {project.name}
      </SidebarLink>
      {project.permissions.manageMembers && (
        <SidebarLink
          to={settingsPath}
          active={inSettings}
          nested
          icon={<Settings aria-hidden="true" className="size-3.5 shrink-0" strokeWidth={1.75} />}
        >
          Settings
        </SidebarLink>
      )}
    </li>
  );
}
