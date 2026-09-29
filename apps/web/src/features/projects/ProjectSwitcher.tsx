import { NavLink } from "react-router";
import { useProjects } from "../../api/queries.ts";
import { Skeleton } from "../../components/Skeleton.tsx";
import { classNames } from "../../lib/class-names.ts";
import { ProjectIcon } from "./ProjectIcon.tsx";

export function ProjectSwitcher() {
  return (
    <div>
      <h2 className="px-2 pb-2 text-xs font-medium text-ink-subtle">Projects</h2>
      <ProjectLinks />
    </div>
  );
}

function ProjectLinks() {
  const projectsQuery = useProjects();

  if (projectsQuery.isPending) {
    return (
      <div className="space-y-2 px-2 py-1">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-5 w-28" />
      </div>
    );
  }

  if (projectsQuery.isError) {
    return <p className="px-2 text-ink-muted">Projects could not be loaded.</p>;
  }

  return (
    <ul className="space-y-0.5">
      {projectsQuery.data.map((project) => (
        <li key={project.id}>
          <NavLink to={`/projects/${project.id}`} className={projectLinkClassName}>
            <ProjectIcon project={project} />
            <span className="truncate">{project.name}</span>
          </NavLink>
        </li>
      ))}
    </ul>
  );
}

function projectLinkClassName({ isActive }: { isActive: boolean }): string {
  return classNames(
    "flex h-8 items-center gap-2.5 rounded-md px-2 font-medium transition-colors",
    isActive ? "bg-surface-muted text-ink" : "text-ink-muted hover:bg-surface-hover hover:text-ink",
  );
}
