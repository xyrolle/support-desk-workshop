import type { Project } from "@support-desk/shared";
import { Skeleton } from "../../components/Skeleton.tsx";
import { ProjectIcon } from "./ProjectIcon.tsx";

export function ProjectHeader({ project }: { project: Project }) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b border-line px-8">
      <title>{`${project.name} · Support Desk`}</title>
      <ProjectIcon project={project} size="lg" />
      <div className="min-w-0">
        <h1 className="truncate text-[15px] font-semibold tracking-tight">{project.name}</h1>
        <p className="truncate text-[13px] text-ink-muted">{project.description}</p>
      </div>
    </header>
  );
}

export function ProjectHeaderSkeleton() {
  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b border-line px-8">
      <Skeleton className="size-8 rounded-lg" />
      <div className="space-y-1.5">
        <Skeleton className="h-3.5 w-28" />
        <Skeleton className="h-3 w-56" />
      </div>
    </header>
  );
}
