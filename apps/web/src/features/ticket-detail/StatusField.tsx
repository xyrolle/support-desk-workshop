import { statusNames, type TicketStatus, ticketStatuses } from "@support-desk/shared";
import { PermissionHint } from "../../components/PermissionHint.tsx";
import { Select, SelectItem, SelectPopup, SelectTrigger } from "../../components/ui/Select.tsx";
import { StatusIcon } from "../../components/ui/StatusIcon.tsx";

type StatusFieldProps = {
  status: TicketStatus;
  blockedReason: string | null;
  onChange: (status: TicketStatus) => void;
};

export function StatusField({ status, blockedReason, onChange }: StatusFieldProps) {
  return (
    <PermissionHint reason={blockedReason}>
      <Select
        value={status}
        onValueChange={(value) => value && onChange(value)}
        disabled={blockedReason !== null}
      >
        <SelectTrigger appearance="inline" aria-label={`Status: ${statusNames[status]}`}>
          <StatusIcon status={status} />
          {statusNames[status]}
        </SelectTrigger>
        <SelectPopup>
          {ticketStatuses.map((option) => (
            <SelectItem key={option} value={option}>
              <StatusIcon status={option} />
              {statusNames[option]}
            </SelectItem>
          ))}
        </SelectPopup>
      </Select>
    </PermissionHint>
  );
}
