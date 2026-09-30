import { statusNames } from "@support-desk/shared";
import { useState } from "react";
import { Select, SelectItem, SelectPopup, SelectTrigger } from "../../components/ui/Select.tsx";
import { StatusIcon, type StatusKind } from "../../components/ui/StatusIcon.tsx";
import { statusKinds } from "../kit-data.ts";

/** Several choices: `multiple` keeps the popup open and gives an array. */
export function StatusMultiSelectDemo() {
  const [statuses, setStatuses] = useState<StatusKind[]>(["open", "blocked"]);

  return (
    <Select multiple value={statuses} onValueChange={setStatuses}>
      <SelectTrigger aria-label="Statuses" className="w-48">
        <span className="flex gap-0.5">
          {statuses.map((status) => (
            <StatusIcon key={status} status={status} />
          ))}
        </span>
        <span className="truncate">{summarize(statuses)}</span>
      </SelectTrigger>
      <SelectPopup>
        {statusKinds.map((kind) => (
          <SelectItem key={kind} value={kind}>
            <StatusIcon status={kind} />
            {statusNames[kind]}
          </SelectItem>
        ))}
      </SelectPopup>
    </Select>
  );
}

function summarize(statuses: StatusKind[]): string {
  if (statuses.length === 0) {
    return "Any status";
  }
  if (statuses.length > 2) {
    return `${statuses.length} statuses`;
  }
  return statuses.map((status) => statusNames[status]).join(", ");
}
