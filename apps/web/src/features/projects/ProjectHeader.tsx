import type { Project } from "@support-desk/shared";
import type { ReactNode } from "react";
import { type Breadcrumb, Breadcrumbs } from "../../components/Breadcrumbs.tsx";
import { PageHeader } from "../../components/PageHeader.tsx";
import { TopBar } from "../../components/TopBar.tsx";
import { Skeleton } from "../../components/ui/Skeleton.tsx";
import { ProjectIcon } from "./ProjectIcon.tsx";

type ProjectHeaderProps = {
  project: Project;
  /** The page inside the project, such as "Tickets" or "Members". */
  page: string;
  title: string;
  description?: string;
  titleBadge?: ReactNode;
  actions?: ReactNode;
  /** Keeps the header as narrow as a settings page's content. */
  narrow?: boolean;
};

export function ProjectHeader({
  project,
  page,
  title,
  description,
  titleBadge,
  actions,
  narrow = false,
}: ProjectHeaderProps) {
  return (
    <header className="shrink-0">
      <title>
        {title === project.name
          ? `${project.name} · Support Desk`
          : `${title} · ${project.name} · Support Desk`}
      </title>
      <TopBar>
        <Breadcrumbs items={[projectCrumb(project), { label: page }]} />
      </TopBar>
      <div className={narrow ? "max-w-4xl" : undefined}>
        <PageHeader
          title={title}
          description={description}
          titleBadge={titleBadge}
          actions={actions}
        />
      </div>
    </header>
  );
}

export function projectCrumb(project: Project): Breadcrumb {
  return {
    label: project.name,
    to: `/projects/${project.id}`,
    icon: <ProjectIcon project={project} />,
  };
}

export function ProjectHeaderSkeleton() {
  return (
    <div className="shrink-0">
      <TopBar>
        <Skeleton className="h-3 w-36" />
      </TopBar>
      <div className="px-8 pt-7 pb-5">
        <div className="flex h-7 items-center">
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="mt-1 flex h-5 items-center">
          <Skeleton className="h-3 w-80" />
        </div>
      </div>
    </div>
  );
}
