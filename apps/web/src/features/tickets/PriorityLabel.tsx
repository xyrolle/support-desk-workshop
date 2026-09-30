import { priorityNames, type TicketPriority } from "@support-desk/shared";
import { PriorityIcon } from "../../components/ui/PriorityIcon.tsx";

export function PriorityLabel({ priority }: { priority: TicketPriority }) {
  return (
    <span className="flex items-center gap-2">
      <PriorityIcon priority={priority} />
      {priorityNames[priority]}
    </span>
  );
}
