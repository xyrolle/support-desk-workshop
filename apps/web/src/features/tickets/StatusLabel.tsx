import { statusNames, type TicketStatus } from "@support-desk/shared";
import { StatusBadge } from "../../components/ui/StatusBadge.tsx";

export function StatusLabel({ status }: { status: TicketStatus }) {
  return <StatusBadge status={status}>{statusNames[status]}</StatusBadge>;
}
