import type { Project } from "@support-desk/shared";
import { Eye } from "lucide-react";
import { Badge } from "../../components/ui/Badge.tsx";
import { Tooltip } from "../../components/ui/Tooltip.tsx";

/** Tells a viewer, up front, that the project is read-only for them. */
export function ReadOnlyBadge({ project }: { project: Project }) {
  if (project.permissions.editTickets) {
    return null;
  }

  return (
    <Tooltip
      content={`You are a viewer in ${project.name}: you can read everything, not change it.`}
    >
      <span>
        <Badge icon={<Eye aria-hidden="true" className="size-3" />}>Read only</Badge>
      </span>
    </Tooltip>
  );
}
