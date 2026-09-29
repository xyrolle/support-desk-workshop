import type { Project } from "@support-desk/shared";
import { classNames } from "../../lib/class-names.ts";

type ProjectIconSize = "sm" | "lg";

const sizeClasses: Record<ProjectIconSize, string> = {
  sm: "size-5 rounded text-[11px]",
  lg: "size-8 rounded-lg text-sm",
};

type ProjectIconProps = {
  project: Project;
  size?: ProjectIconSize;
};

export function ProjectIcon({ project, size = "sm" }: ProjectIconProps) {
  return (
    <span
      aria-hidden="true"
      className={classNames(
        "flex shrink-0 items-center justify-center bg-accent-soft font-semibold text-accent",
        sizeClasses[size],
      )}
    >
      {project.name.charAt(0)}
    </span>
  );
}
