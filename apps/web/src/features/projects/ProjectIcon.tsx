import type { Project } from "@support-desk/shared";

/** The project's first letter on a small tile. Decorative: show the name next to it. */
export function ProjectIcon({ project }: { project: Project }) {
  return (
    <span
      aria-hidden="true"
      className="flex size-4 shrink-0 items-center justify-center rounded-[4px] border border-line bg-canvas text-[9px] font-semibold text-ink-muted"
    >
      {project.name.charAt(0)}
    </span>
  );
}
