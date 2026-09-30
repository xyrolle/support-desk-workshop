import { priorityNames, type TicketPriority, ticketPriorities } from "@support-desk/shared";
import { PermissionHint } from "../../components/PermissionHint.tsx";
import { PriorityIcon } from "../../components/ui/PriorityIcon.tsx";
import { Select, SelectItem, SelectPopup, SelectTrigger } from "../../components/ui/Select.tsx";

type PriorityFieldProps = {
  priority: TicketPriority;
  blockedReason: string | null;
  onChange: (priority: TicketPriority) => void;
};

/** Urgent first in the list, as people think about it. */
const prioritiesMostUrgentFirst = ticketPriorities.toReversed();

export function PriorityField({ priority, blockedReason, onChange }: PriorityFieldProps) {
  return (
    <PermissionHint reason={blockedReason}>
      <Select
        value={priority}
        onValueChange={(value) => value && onChange(value)}
        disabled={blockedReason !== null}
      >
        <SelectTrigger appearance="inline" aria-label={`Priority: ${priorityNames[priority]}`}>
          <PriorityIcon priority={priority} />
          {priorityNames[priority]}
        </SelectTrigger>
        <SelectPopup>
          {prioritiesMostUrgentFirst.map((option) => (
            <SelectItem key={option} value={option}>
              <PriorityIcon priority={option} />
              {priorityNames[option]}
            </SelectItem>
          ))}
        </SelectPopup>
      </Select>
    </PermissionHint>
  );
}
