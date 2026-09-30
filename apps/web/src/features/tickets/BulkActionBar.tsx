import {
  type ProjectMember,
  priorityNames,
  statusNames,
  type TicketChanges,
  ticketPriorities,
  ticketStatuses,
} from "@support-desk/shared";
import { CircleCheck, Signal, UserRound } from "lucide-react";
import { useMembers } from "../../api/queries.ts";
import { Button } from "../../components/ui/Button.tsx";
import { Menu, MenuItem, MenuPopup, MenuTrigger } from "../../components/ui/Menu.tsx";
import { PriorityIcon } from "../../components/ui/PriorityIcon.tsx";
import { SelectionBar } from "../../components/ui/SelectionBar.tsx";
import { StatusIcon } from "../../components/ui/StatusIcon.tsx";

const prioritiesMostUrgentFirst = ticketPriorities.toReversed();
const actionIconClassName = "size-4 text-ink-subtle";

type BulkActionBarProps = {
  projectId: string;
  count: number;
  onClear: () => void;
  onApply: (changes: TicketChanges) => void;
};

/** Status, priority and assignee for the rows currently selected. */
export function BulkActionBar({ projectId, count, onClear, onApply }: BulkActionBarProps) {
  return (
    <SelectionBar count={count} onClear={onClear}>
      <StatusMenu onApply={onApply} />
      <PriorityMenu onApply={onApply} />
      <AssigneeMenu projectId={projectId} onApply={onApply} />
    </SelectionBar>
  );
}

function StatusMenu({ onApply }: { onApply: (changes: TicketChanges) => void }) {
  return (
    <Menu>
      <MenuTrigger render={<Button variant="ghost" size="sm" />}>
        <CircleCheck aria-hidden="true" className={actionIconClassName} />
        Status
      </MenuTrigger>
      <MenuPopup>
        {ticketStatuses.map((status) => (
          <MenuItem
            key={status}
            icon={<StatusIcon status={status} />}
            onClick={() => onApply({ status })}
          >
            {statusNames[status]}
          </MenuItem>
        ))}
      </MenuPopup>
    </Menu>
  );
}

function PriorityMenu({ onApply }: { onApply: (changes: TicketChanges) => void }) {
  return (
    <Menu>
      <MenuTrigger render={<Button variant="ghost" size="sm" />}>
        <Signal aria-hidden="true" className={actionIconClassName} />
        Priority
      </MenuTrigger>
      <MenuPopup>
        {prioritiesMostUrgentFirst.map((priority) => (
          <MenuItem
            key={priority}
            icon={<PriorityIcon priority={priority} />}
            onClick={() => onApply({ priority })}
          >
            {priorityNames[priority]}
          </MenuItem>
        ))}
      </MenuPopup>
    </Menu>
  );
}

function AssigneeMenu({
  projectId,
  onApply,
}: {
  projectId: string;
  onApply: (changes: TicketChanges) => void;
}) {
  const { data: members = [] } = useMembers(projectId);
  const agents = members.filter(canBeAssigned);

  return (
    <Menu>
      <MenuTrigger render={<Button variant="ghost" size="sm" />}>
        <UserRound aria-hidden="true" className={actionIconClassName} />
        Assignee
      </MenuTrigger>
      <MenuPopup>
        <MenuItem onClick={() => onApply({ assigneeId: null })}>Unassigned</MenuItem>
        {agents.map((member) => (
          <MenuItem key={member.id} onClick={() => onApply({ assigneeId: member.id })}>
            {member.name}
          </MenuItem>
        ))}
      </MenuPopup>
    </Menu>
  );
}

function canBeAssigned(member: ProjectMember): boolean {
  return member.role !== "viewer";
}
