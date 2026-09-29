import type { User } from "@support-desk/shared";
import { Avatar } from "../../components/Avatar.tsx";

export function AssigneeLabel({ assignee }: { assignee: User | null }) {
  if (!assignee) {
    return (
      <span className="flex items-center gap-2 text-ink-subtle">
        <span
          aria-hidden="true"
          className="size-6 shrink-0 rounded-full border border-dashed border-current"
        />
        Unassigned
      </span>
    );
  }

  return (
    <span className="flex min-w-0 items-center gap-2">
      <Avatar user={assignee} />
      <span className="truncate">{assignee.name}</span>
    </span>
  );
}
