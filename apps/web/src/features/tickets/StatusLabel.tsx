import type { TicketStatus } from "@support-desk/shared";
import { StatusBadge } from "../../components/ui/StatusBadge.tsx";
import { statusLabels } from "./ticket-labels.ts";

export function StatusLabel({ status }: { status: TicketStatus }) {
  return <StatusBadge status={status}>{statusLabels[status]}</StatusBadge>;
}
