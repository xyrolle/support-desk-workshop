import { statusNames } from "@support-desk/shared";
import { ListFilter } from "lucide-react";
import { useState } from "react";
import { Select, SelectItem, SelectPopup, SelectTrigger } from "../../components/ui/Select.tsx";
import { StatusIcon, type StatusKind } from "../../components/ui/StatusIcon.tsx";
import { statusKinds } from "../kit-data.ts";

/** A single choice, with a `null` item that clears it. */
export function StatusSelectDemo() {
  const [status, setStatus] = useState<StatusKind | null>("in_progress");

  return (
    <Select value={status} onValueChange={setStatus}>
      <SelectTrigger aria-label="Filter by status" className="w-40">
        {status ? <StatusIcon status={status} /> : <AllStatusesIcon />}
        {status ? statusNames[status] : "All statuses"}
      </SelectTrigger>
      <SelectPopup>
        <SelectItem value={null}>
          <AllStatusesIcon />
          All statuses
        </SelectItem>
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

function AllStatusesIcon() {
  return <ListFilter aria-hidden="true" className="size-3.5 shrink-0 text-ink-subtle" />;
}
