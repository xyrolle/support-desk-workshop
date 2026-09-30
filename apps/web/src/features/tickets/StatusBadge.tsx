import { statusNames, type TicketStatus } from "@support-desk/shared";
import { classNames } from "../../lib/class-names.ts";

const statusClasses: Record<TicketStatus, { badge: string; dot: string }> = {
  open: {
    badge:
      "bg-sky-50 text-sky-700 ring-sky-600/15 dark:bg-sky-400/10 dark:text-sky-300 dark:ring-sky-400/20",
    dot: "bg-sky-500",
  },
  in_progress: {
    badge:
      "bg-amber-50 text-amber-800 ring-amber-600/20 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/20",
    dot: "bg-amber-500",
  },
  blocked: {
    badge:
      "bg-rose-50 text-rose-700 ring-rose-600/15 dark:bg-rose-400/10 dark:text-rose-300 dark:ring-rose-400/20",
    dot: "bg-rose-500",
  },
  resolved: {
    badge:
      "bg-emerald-50 text-emerald-700 ring-emerald-600/15 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-400/20",
    dot: "bg-emerald-500",
  },
  closed: {
    badge:
      "bg-zinc-100 text-zinc-600 ring-zinc-500/15 dark:bg-zinc-400/10 dark:text-zinc-400 dark:ring-zinc-400/20",
    dot: "bg-zinc-400",
  },
};

export function StatusBadge({ status }: { status: TicketStatus }) {
  const classes = statusClasses[status];

  return (
    <span
      className={classNames(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 align-middle text-xs font-medium ring-1 ring-inset",
        classes.badge,
      )}
    >
      <span aria-hidden="true" className={classNames("size-1.5 rounded-full", classes.dot)} />
      {statusNames[status]}
    </span>
  );
}
