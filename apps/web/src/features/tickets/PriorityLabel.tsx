import type { TicketPriority } from "@support-desk/shared";
import { PriorityIcon } from "../../components/ui/PriorityIcon.tsx";
import { priorityLabels } from "./ticket-labels.ts";

export function PriorityLabel({ priority }: { priority: TicketPriority }) {
  return (
    <span className="flex items-center gap-2">
      <PriorityIcon priority={priority} />
      {priorityLabels[priority]}
    </span>
  );
}
