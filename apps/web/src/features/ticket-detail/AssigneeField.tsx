import type { ProjectMember, User } from "@support-desk/shared";
import { useMembers } from "../../api/queries.ts";
import { PermissionHint } from "../../components/PermissionHint.tsx";
import { Avatar } from "../../components/ui/Avatar.tsx";
import {
  Combobox,
  ComboboxItem,
  ComboboxPopup,
  ComboboxTrigger,
} from "../../components/ui/Combobox.tsx";
import { classNames } from "../../lib/class-names.ts";
import { AssigneeLabel } from "../tickets/AssigneeLabel.tsx";

type AssigneeOption = {
  id: string | null;
  label: string;
  user: User | null;
};

const unassigned: AssigneeOption = { id: null, label: "Unassigned", user: null };

type AssigneeFieldProps = {
  projectId: string;
  assignee: User | null;
  blockedReason: string | null;
  onChange: (assigneeId: string | null) => void;
};

/** Only the project's agents and admins can be assigned, so only they are offered. */
export function AssigneeField({
  projectId,
  assignee,
  blockedReason,
  onChange,
}: AssigneeFieldProps) {
  const { data: members = [] } = useMembers(projectId);
  const options = [unassigned, ...members.filter(canBeAssigned).map(toOption)];
  const selected = assignee ? toOption(assignee) : unassigned;
  const isDisabled = blockedReason !== null;

  return (
    <PermissionHint reason={blockedReason}>
      <Combobox
        items={options}
        value={selected}
        onValueChange={(option: AssigneeOption | null) => option && onChange(option.id)}
        itemToStringLabel={(option: AssigneeOption) => option.label}
        isItemEqualToValue={(item: AssigneeOption, value: AssigneeOption) => item.id === value.id}
        disabled={isDisabled}
      >
        <ComboboxTrigger
          aria-label={`Assignee: ${selected.label}`}
          disabled={isDisabled}
          className={classNames(
            "flex h-8 w-full items-center rounded-md px-2 transition-colors",
            "focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-accent",
            isDisabled
              ? "cursor-not-allowed opacity-60"
              : "hover:bg-surface-hover data-popup-open:bg-surface-hover",
          )}
        >
          <AssigneeLabel assignee={assignee} />
        </ComboboxTrigger>
        <ComboboxPopup placeholder="Assign to…" emptyText="No agent or admin matches.">
          {(option: AssigneeOption) => (
            <ComboboxItem key={option.id ?? "unassigned"} value={option}>
              {option.user ? (
                <Avatar user={option.user} />
              ) : (
                <span
                  aria-hidden="true"
                  className="size-5 shrink-0 rounded-full border border-dashed border-ink-subtle"
                />
              )}
              {option.label}
            </ComboboxItem>
          )}
        </ComboboxPopup>
      </Combobox>
    </PermissionHint>
  );
}

function canBeAssigned(member: ProjectMember): boolean {
  return member.role !== "viewer";
}

function toOption(user: User): AssigneeOption {
  return { id: user.id, label: user.name, user };
}
