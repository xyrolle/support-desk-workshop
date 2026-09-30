import type { ReactNode } from "react";
import { classNames } from "../../lib/class-names.ts";
import { StatusIcon, type StatusKind } from "./StatusIcon.tsx";

const toneClasses: Record<StatusKind, string> = {
  open: "bg-surface-muted text-ink-muted",
  in_progress: "bg-status-in-progress/12 text-status-in-progress",
  blocked: "bg-status-blocked/12 text-status-blocked",
  resolved: "bg-status-resolved/12 text-status-resolved",
  closed: "bg-surface-muted text-ink-muted",
};

type StatusBadgeProps = {
  status: StatusKind;
  /** The status name, for example "In progress". */
  children: ReactNode;
};

/** A status chip: the glyph and the name on a tint. Only statuses that need attention get colour. */
export function StatusBadge({ status, children }: StatusBadgeProps) {
  return (
    <span
      className={classNames(
        "inline-flex h-[22px] items-center gap-1.5 rounded-md pr-2 pl-1.5 align-middle text-xs font-medium whitespace-nowrap",
        toneClasses[status],
      )}
    >
      <StatusIcon status={status} />
      {children}
    </span>
  );
}
