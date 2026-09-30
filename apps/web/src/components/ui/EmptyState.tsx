import { Inbox, type LucideIcon } from "lucide-react";
import { type StateContent, StateMessage } from "./StateMessage.tsx";

type EmptyStateProps = StateContent & {
  icon?: LucideIcon;
};

export function EmptyState({ icon = Inbox, ...content }: EmptyStateProps) {
  return <StateMessage icon={icon} tone="neutral" {...content} />;
}
