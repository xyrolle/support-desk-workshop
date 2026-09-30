import type { Project } from "@support-desk/shared";
import { Breadcrumbs } from "../../components/Breadcrumbs.tsx";
import { PageHeader } from "../../components/PageHeader.tsx";
import { TopBar } from "../../components/TopBar.tsx";
import { Skeleton } from "../../components/ui/Skeleton.tsx";
import { ProjectIcon } from "./ProjectIcon.tsx";

export function ProjectHeader({ project }: { project: Project }) {
  return (
    <header className="shrink-0">
      <title>{`${project.name} · Support Desk`}</title>
      <TopBar>
        <Breadcrumbs
          items={[
            {
              label: project.name,
              to: `/projects/${project.id}`,
              icon: <ProjectIcon project={project} />,
            },
            { label: "Tickets" },
          ]}
        />
      </TopBar>
      <PageHeader title={project.name} description={project.description} />
    </header>
  );
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
