import type { User } from "@support-desk/shared";
import { useState } from "react";
import { Avatar } from "../../components/ui/Avatar.tsx";
import {
  Combobox,
  ComboboxItem,
  ComboboxPopup,
  ComboboxTrigger,
} from "../../components/ui/Combobox.tsx";
import { checkoutMembers, diego } from "../kit-data.ts";

/** A searchable picker. The trigger looks like the value it edits, as in a table cell. */
export function AssigneeComboboxDemo() {
  const [assignee, setAssignee] = useState<User | null>(diego);

  return (
    <Combobox
      items={checkoutMembers}
      value={assignee}
      onValueChange={setAssignee}
      itemToStringLabel={(user: User) => user.name}
      isItemEqualToValue={(item: User, value: User) => item.id === value.id}
    >
      <ComboboxTrigger
        aria-label={`Assignee: ${assignee?.name ?? "Unassigned"}`}
        className="-ml-1.5 flex h-8 items-center gap-2 rounded-md px-1.5 transition-colors hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-accent data-popup-open:bg-surface-hover"
      >
        {assignee && <Avatar user={assignee} />}
        {assignee?.name ?? "Unassigned"}
      </ComboboxTrigger>
      <ComboboxPopup placeholder="Assign to…" emptyText="No teammate matches.">
        {(user: User) => (
          <ComboboxItem key={user.id} value={user}>
            <Avatar user={user} />
            {user.name}
          </ComboboxItem>
        )}
      </ComboboxPopup>
    </Combobox>
  );
}
